import ProductBrowser from "@/components/ProductBrowser";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <section className="border-b border-gray-200 bg-gradient-to-b from-indigo-50 to-white px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Find What You&apos;re Looking For
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Search and discover products easily with Shopio.
        </p>
      </section>

      {error ? (
        <p className="mx-auto max-w-6xl px-4 py-10 text-center text-red-600">
          Could not load products. Please check your Supabase configuration.
        </p>
      ) : (
        <ProductBrowser products={products || []} />
      )}
    </div>
  );
}
