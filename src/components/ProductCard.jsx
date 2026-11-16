import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import { PLACEHOLDER_IMAGE, formatPrice } from "@/lib/shop";

const LOW_STOCK = 10;

export default function ProductCard({ product, eager = false }) {
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= LOW_STOCK;

  return (
    <div className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10">
      <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image_url || PLACEHOLDER_IMAGE}
          alt={product.name}
          width={400}
          height={400}
          sizes="(min-width: 1024px) 270px, (min-width: 768px) 33vw, 50vw"
          loading={eager ? "eager" : "lazy"}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${outOfStock ? "opacity-60 grayscale" : ""}`}
        />
        {outOfStock && (
          <span className="absolute top-2 left-2 rounded-full bg-gray-900/85 px-2 py-0.5 text-[10px] font-semibold text-white sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-xs">
            Out of Stock
          </span>
        )}
        {lowStock && (
          <span className="absolute top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-xs">
            Only {product.stock} left
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <span className="text-[10px] font-semibold tracking-wide text-indigo-600 uppercase sm:text-xs">
          {product.category}
        </span>
        <Link
          href={`/product/${product.id}`}
          className="mt-1 line-clamp-2 text-sm leading-snug font-semibold text-gray-900 transition hover:text-indigo-600 sm:line-clamp-1 sm:text-base"
        >
          {product.name}
        </Link>
        <p className="mt-1.5 text-base font-bold tracking-tight text-gray-900 sm:text-xl">{formatPrice(product.price)}</p>

        <div className="mt-auto grid grid-cols-1 gap-1.5 pt-3 sm:grid-cols-2 sm:gap-2 sm:pt-4">
          <Link href={`/product/${product.id}`} className="btn-secondary px-2 py-2 text-xs lg:text-sm">
            View Details
          </Link>
          <AddToCartButton product={product} className="px-2 py-2 text-xs lg:text-sm" />
        </div>
      </div>
    </div>
  );
}
