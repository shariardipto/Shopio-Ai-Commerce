import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <p className="mt-2 text-gray-600">
          The product you are looking for does not exist or was removed.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-50">
          <Image
            src={product.image_url || "/images/placeholder.svg"}
            alt={product.name}
            width={600}
            height={600}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <span className="text-sm font-medium uppercase tracking-wide text-indigo-500">
            {product.category}
          </span>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            ৳{Number(product.price).toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">{product.description}</p>

          <div className="mt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
