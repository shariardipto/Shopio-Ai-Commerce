import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@/utils/supabase/server";
import { CATEGORIES, MAX_IMAGE_SIZE } from "@/lib/shop";
import { matchProductsByTerms } from "@/lib/search";

/*
  AI IMAGE SEARCH
  Browser uploads image -> this Route Handler -> Gemini identifies the object
  and returns search terms -> we search OUR Supabase products with those terms
  -> exact matches, or related products if there is no exact match.
  Gemini never invents products: everything shown comes from the database.
*/

/*
  Models are tried in this order. "gemini-2.5-flash-lite" is the model from the
  project brief, but Google retires old models over time. If a model no longer
  exists, the next one is tried automatically (the "-latest" names always point
  to Google's current Flash models). GEMINI_MODEL in .env can override the order.
*/
const MODELS = [
  ...new Set(
    [process.env.GEMINI_MODEL, "gemini-2.5-flash-lite", "gemini-flash-lite-latest", "gemini-flash-latest"].filter(Boolean)
  ),
];
let workingModel = null; // remembers the model that worked, so it is tried first next time

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AI_FAILED = "Unable to analyze the image right now. Please try again.";
const MAX_RELATED = 8;

// Vercel: allow enough time for the AI request.
export const maxDuration = 30;

const PROMPT = `You are an ecommerce visual product search classifier.

Analyze the uploaded image.
Identify the MAIN purchasable product/object.

Return JSON with:
- "object": simple product name (e.g. "pen")
- "category": general ecommerce category
- "searchTerms": 3 short terms describing the detected object (exact term, alternative term, common term)
- "relatedTerms": 4 products reasonably related to the detected object

Rules:
- Focus on the primary object.
- Use short, simple English ecommerce terms in lowercase.
- Do not invent shop inventory.
- searchTerms must describe the detected object.
- relatedTerms should contain products reasonably related to the detected object.
- If no purchasable product is visible, set "object" to "unknown".
- Return structured JSON only. Do not return Markdown explanations.`;

// Gemini structured output: the answer must follow this JSON shape.
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    object: { type: Type.STRING },
    category: { type: Type.STRING },
    searchTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
    relatedTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["object", "category", "searchTerms", "relatedTerms"],
  propertyOrdering: ["object", "category", "searchTerms", "relatedTerms"],
};

function errorResponse(message, status) {
  return Response.json({ error: message }, { status });
}

function isConfigured() {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey !== "your_gemini_api_key");
}

// The model name is wrong / retired -> try the next model.
function isModelUnavailable(error) {
  return error?.status === 404 || /not found|not supported|no longer available|deprecated/i.test(String(error?.message));
}

// Turns Gemini API errors into a clear message for the customer (and the right HTTP status).
function friendlyAiError(error) {
  const text = String(error?.message || "");
  if ((error?.status === 400 && /api key/i.test(text)) || error?.status === 401 || error?.status === 403) {
    return { status: 503, message: "AI image search is not configured correctly. Please check the Gemini API key." };
  }
  if (error?.status === 429 || /quota|rate limit|resource_exhausted/i.test(text)) {
    return { status: 429, message: "AI image search is busy right now (usage limit reached). Please try again in a minute." };
  }
  return { status: 502, message: AI_FAILED };
}

// Asks Gemini, trying the next model if one is not available.
async function askGemini(ai, request) {
  const order = workingModel ? [workingModel, ...MODELS.filter((m) => m !== workingModel)] : MODELS;
  let lastError;
  for (const model of order) {
    try {
      const response = await ai.models.generateContent({ ...request, model });
      workingModel = model;
      return response.text;
    } catch (error) {
      lastError = error;
      if (!isModelUnavailable(error)) break; // e.g. wrong key: another model will not help
      console.warn(`Image search: model "${model}" is not available, trying the next one.`);
    }
  }
  throw lastError;
}

// Gemini returns JSON; remove Markdown code fences just in case before parsing.
function parseJson(text) {
  const cleaned = String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  return JSON.parse(cleaned);
}

// GET /api/image-search -> quick check that the AI is set up (never shows the key).
export function GET() {
  return Response.json({ configured: isConfigured(), models: workingModel ? [workingModel] : MODELS });
}

// " Ballpoint PEN!! " -> "ballpoint pen"
function cleanTerm(value) {
  if (typeof value !== "string") return "";
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

function cleanList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(cleanTerm).filter(Boolean))].slice(0, 8);
}

// Never trust the AI output blindly: check and normalise every field.
function normalizeDetection(raw) {
  if (!raw || typeof raw !== "object") return null;
  const object = cleanTerm(raw.object);
  if (!object || object === "unknown") return null;
  return {
    object,
    category: cleanTerm(raw.category),
    searchTerms: cleanList(raw.searchTerms),
    relatedTerms: cleanList(raw.relatedTerms),
  };
}

export async function POST(request) {
  if (!isConfigured()) {
    return errorResponse("AI image search is not configured.", 503);
  }

  // 1. Validate the uploaded image.
  let image;
  try {
    image = (await request.formData()).get("image");
  } catch {
    return errorResponse("Please upload an image.", 400);
  }
  if (!image || typeof image === "string" || image.size === 0) {
    return errorResponse("Please upload an image.", 400);
  }
  if (!ALLOWED_TYPES.includes(image.type)) {
    return errorResponse("Only JPG, PNG or WEBP images are allowed.", 415);
  }
  if (image.size > MAX_IMAGE_SIZE) {
    return errorResponse("Image is too large. Maximum size is 4 MB.", 413);
  }

  // 2. Ask Gemini what the main object is.
  let text;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const base64Image = Buffer.from(await image.arrayBuffer()).toString("base64");

    text = await askGemini(ai, {
      contents: [
        {
          role: "user",
          parts: [{ inlineData: { mimeType: image.type, data: base64Image } }, { text: PROMPT }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });
  } catch (error) {
    // Network / API errors (wrong key, quota, model problems...).
    console.error("Image search: Gemini request failed:", error?.status, error?.message || error);
    const { status, message } = friendlyAiError(error);
    return errorResponse(message, status);
  }

  let detected;
  try {
    detected = normalizeDetection(parseJson(text));
  } catch {
    console.error("Image search: Gemini returned malformed JSON:", String(text).slice(0, 200));
    return errorResponse(AI_FAILED, 502);
  }

  if (!detected) {
    return errorResponse("Could not recognise a product in this image. Please try a clearer photo.", 422);
  }

  // 3. Load the real Shopio catalog from Supabase.
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, category, keywords, image_url, stock");

  if (error) {
    return errorResponse("Could not load products. Please try again.", 500);
  }

  // Broad words like "stationery" would match too many products to count as "exact".
  const broadTerms = [...CATEGORIES, detected.category];

  // 4. Exact search: first the detected object itself, then the other search terms.
  let exact = matchProductsByTerms(products, [detected.object], broadTerms);
  if (exact.length === 0) {
    exact = matchProductsByTerms(products, detected.searchTerms, broadTerms);
  }

  if (exact.length > 0) {
    return Response.json({ detected, matchType: "exact", products: exact });
  }

  // 5. No exact product: look for related products that really exist in the database.
  const related = matchProductsByTerms(products, [...detected.relatedTerms, detected.category]).slice(
    0,
    MAX_RELATED
  );

  return Response.json({
    detected,
    matchType: related.length > 0 ? "related" : "none",
    products: related,
  });
}
