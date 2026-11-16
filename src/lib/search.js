// Search helpers shared by the normal text search and the AI image search.

// Very small plural fix so "pens" matches "pen" and "shoes" matches "shoe".
function singular(word) {
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) {
    return word.slice(0, -1);
  }
  return word;
}

// Turns text into simple lowercase words: "  Blue Ballpoint-PENS " -> ["blue", "ballpoint", "pen"]
export function toWords(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map(singular);
}

// All searchable words of a product: name + category + keywords.
function productWords(product) {
  return toWords([product.name, product.category, ...(product.keywords || [])].join(" "));
}

/*
  NORMAL TEXT SEARCH (no AI)
  Every word the user typed must match the beginning of a product word,
  so "mou" finds "Wireless Mouse". Exact word matches are listed first,
  so "pen" shows the pens before "HB Pencil".
*/
export function searchProducts(products, query) {
  if (!String(query || "").trim()) return products;

  const queryWords = toWords(query);
  if (queryWords.length === 0) return [];

  const results = [];
  for (const product of products) {
    const words = productWords(product);
    let score = 0;
    let matchesEveryWord = true;

    for (const queryWord of queryWords) {
      if (words.includes(queryWord)) score += 2;
      else if (words.some((word) => word.startsWith(queryWord))) score += 1;
      else {
        matchesEveryWord = false;
        break;
      }
    }

    if (matchesEveryWord) results.push({ product, score });
  }

  return results.sort((a, b) => b.score - a.score).map((result) => result.product);
}

/*
  AI IMAGE SEARCH MATCHING
  Gemini gives us terms like "pen" or "ballpoint pen". A term matches a
  product when EVERY word of the term is a whole word of the product
  ("pen" matches "Blue Ballpoint Pen" but not "HB Pencil").
  Broad words such as category names can be ignored so that "stationery"
  does not match every stationery product.
  Products matching more terms come first.
*/
export function matchProductsByTerms(products, terms, ignoreTerms = []) {
  const ignored = new Set(ignoreTerms.map((term) => toWords(term).join(" ")));

  const phrases = [];
  for (const term of terms) {
    const words = toWords(term);
    const key = words.join(" ");
    if (words.length > 0 && !ignored.has(key) && !phrases.some((p) => p.join(" ") === key)) {
      phrases.push(words);
    }
  }

  const results = [];
  for (const product of products) {
    const words = productWords(product);
    const matches = phrases.filter((phrase) => phrase.every((word) => words.includes(word))).length;
    if (matches > 0) results.push({ product, matches });
  }

  return results.sort((a, b) => b.matches - a.matches).map((result) => result.product);
}
