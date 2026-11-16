"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CATEGORIES, MAX_IMAGE_SIZE, ORDER_STATUSES } from "@/lib/shop";

const BUCKET = "product-images";

/*
  Every admin action checks the role again on the server (never trust the browser).
  Even if this check were skipped, Supabase RLS would still block non-admins.
*/
async function getAdminSupabase() {
  const { supabase, isAdmin } = await getCurrentUser();
  return isAdmin ? supabase : null;
}

// Reads and validates the product form fields.
function readProductForm(formData) {
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "");
  const priceText = String(formData.get("price") || "").trim();
  const stockText = String(formData.get("stock") || "").trim();
  const description = String(formData.get("description") || "").trim();

  // "pen, Writing , ballpoint" -> ["pen", "writing", "ballpoint"]
  const keywords = [
    ...new Set(
      String(formData.get("keywords") || "")
        .split(",")
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];

  const price = Number(priceText);
  const stock = Number(stockText);

  let error = null;
  if (!name) error = "Product name is required.";
  else if (!CATEGORIES.includes(category)) error = "Please choose a category.";
  else if (!priceText || !Number.isFinite(price) || price < 0) error = "Please enter a valid price.";
  else if (!stockText || !Number.isInteger(stock) || stock < 0) error = "Stock must be a whole number (0 or more).";

  return { error, values: { name, category, price, stock, description, keywords } };
}

// Uploads the image to Supabase Storage and returns its public URL.
async function uploadImage(supabase, file) {
  if (!file || typeof file === "string" || file.size === 0) return { url: null };
  if (!file.type.startsWith("image/")) return { error: "Product image must be an image file." };
  if (file.size > MAX_IMAGE_SIZE) return { error: "Product image must be 4 MB or smaller." };

  const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `products/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) return { error: "Image upload failed. Please try again." };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

// Removes an old image from Storage (only images that were uploaded to our bucket).
async function removeImage(supabase, imageUrl) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  if (!imageUrl || !imageUrl.includes(marker)) return;
  await supabase.storage.from(BUCKET).remove([imageUrl.split(marker)[1]]);
}

export async function createProduct(formData) {
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Only admins can add products." };

  const { error, values } = readProductForm(formData);
  if (error) return { error };

  const image = await uploadImage(supabase, formData.get("image"));
  if (image.error) return { error: image.error };

  const { error: dbError } = await supabase.from("products").insert({ ...values, image_url: image.url });
  if (dbError) {
    await removeImage(supabase, image.url);
    return { error: "Could not save the product. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/products?status=created");
}

export async function updateProduct(productId, formData) {
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Only admins can edit products." };

  const { error, values } = readProductForm(formData);
  if (error) return { error };

  const { data: existing } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", productId)
    .maybeSingle();
  if (!existing) return { error: "Product not found." };

  const image = await uploadImage(supabase, formData.get("image"));
  if (image.error) return { error: image.error };

  const changes = image.url ? { ...values, image_url: image.url } : values;
  const { error: dbError } = await supabase.from("products").update(changes).eq("id", productId);
  if (dbError) {
    await removeImage(supabase, image.url);
    return { error: "Could not save the product. Please try again." };
  }

  // The image was replaced: delete the old file.
  if (image.url) await removeImage(supabase, existing.image_url);

  revalidatePath("/", "layout");
  redirect("/admin/products?status=updated");
}

export async function deleteProduct(productId) {
  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Only admins can delete products." };

  const { data: product } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", productId)
    .maybeSingle();

  // Old orders keep their item name/price snapshot (product_id becomes empty).
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: "Could not delete the product. Please try again." };

  await removeImage(supabase, product?.image_url);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateOrderStatus(orderId, status) {
  if (!ORDER_STATUSES.includes(status)) return { error: "Invalid order status." };

  const supabase = await getAdminSupabase();
  if (!supabase) return { error: "Only admins can update orders." };

  const { error } = await supabase.from("orders").update({ order_status: status }).eq("id", orderId);
  if (error) return { error: "Could not update the order status." };

  revalidatePath("/admin", "layout");
  revalidatePath("/my-orders");
  return { success: true };
}
