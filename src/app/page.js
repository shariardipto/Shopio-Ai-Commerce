import ProductBrowser from "@/components/ProductBrowser";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

// Products always come from the Supabase database.
async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, category, keywords, image_url, stock")
    .order("created_at", { ascending: false });

  return { products: data || [], error: Boolean(error) };
}

export default function HomePage() {
  // Not awaited on purpose: the hero and search bar appear immediately,
  // and the product grid streams in when the database answers.
  const productsPromise = getProducts();

  return <ProductBrowser productsPromise={productsPromise} />;
}
