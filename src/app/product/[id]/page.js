import { Suspense, cache } from "react";
import Link from "next/link";
import Image from "next/image";
import Icon from "@/components/Icon";
import PaymentBadges from "@/components/PaymentBadges";
import ProductCard from "@/components/ProductCard";
import ProductPurchase from "@/components/ProductPurchase";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { PLACEHOLDER_IMAGE, SHIPPING_FEE, formatPrice, isUuid } from "@/lib/shop";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

// cache(): the page and generateMetadata share ONE database query per request.
const getProduct = cache(async (id) => {
  if (!isUuid(id)) return null; // e.g. /product/abc -> "not found" without a query
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  return data;
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  return product
    ? { title: product.name, description: product.description || `Buy ${product.name} at Shopio.` }
    : { title: "Product not found" };
}

// "You may also like": other products from the same category (streamed in separately).
async function RelatedProducts({ product }) {
  const supabase = await createClient();
  const { data: related } = await supabase
    .from("products")
    .select("id, name, price, category, image_url, stock")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(4);

  if (!related?.length) return null;

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold text-gray-900">You may also like</h2>
      <div className="mt-5 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}

const PERKS = [
  { icon: "truck", title: "All over Bangladesh", text: `Flat ${formatPrice(SHIPPING_FEE)} · 2–5 days` },
  { icon: "cash", title: "Cash on Delivery", text: "Or bKash, Nagad, Rocket, card" },
  { icon: "shield", title: "Secure checkout", text: "Protected by Supabase Auth" },
];

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <Icon name="package" className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">Product not found</h1>
        <p className="mt-2 text-gray-600">The product you are looking for does not exist or was removed.</p>
        <Link href="/" className="btn-primary mt-6">
          <Icon name="arrowLeft" className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const lowStock = inStock && product.stock <= 10;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        <Icon name="chevronRight" className="h-4 w-4" />
        <span>{product.category}</span>
        <Icon name="chevronRight" className="h-4 w-4" />
        <span className="truncate font-medium text-gray-900">{product.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-14">
        <div className="animate-fade-up overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-sm">
          <Image
            src={product.image_url || PLACEHOLDER_IMAGE}
            alt={product.name}
            width={640}
            height={640}
            sizes="(min-width: 768px) 50vw, 100vw"
            loading="eager"
            className="aspect-square h-full w-full object-cover"
          />
        </div>

        <div className="flex animate-fade-up flex-col [animation-delay:100ms]">
          <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
            {product.category}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-gray-900">{formatPrice(product.price)}</p>

          <div className="mt-4 flex items-center gap-2 text-sm">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${
                !inStock
                  ? "bg-red-50 text-red-700"
                  : lowStock
                    ? "bg-amber-50 text-amber-700"
                    : "bg-green-50 text-green-700"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${!inStock ? "bg-red-500" : lowStock ? "bg-amber-500" : "bg-green-500"}`} />
              {!inStock ? "Out of Stock" : lowStock ? `Only ${product.stock} left` : "In Stock"}
            </span>
            {inStock && !lowStock && <span className="text-gray-500">{product.stock} available</span>}
          </div>

          {product.description && (
            <p className="mt-6 leading-relaxed text-gray-600">{product.description}</p>
          )}

          <ProductPurchase product={product} />

          <div className="mt-8 grid gap-3 border-t border-gray-200 pt-6 sm:grid-cols-3">
            {PERKS.map((perk) => (
              <div key={perk.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon name={perk.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{perk.title}</p>
                  <p className="text-xs text-gray-500">{perk.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="font-medium">We accept:</span>
            <PaymentBadges />
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="mt-16">
            <div className="skeleton h-6 w-48" />
            <div className="mt-5">
              <ProductGridSkeleton count={4} />
            </div>
          </div>
        }
      >
        <RelatedProducts product={product} />
      </Suspense>
    </div>
  );
}
