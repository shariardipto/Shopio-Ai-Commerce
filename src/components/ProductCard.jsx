"use client";

import Link from "next/link";
import Image from "next/image";
import { addToCart } from "@/lib/cart";

export default function ProductCard({ product }) {
  function handleAddToCart() {
    addToCart(product, 1);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/product/${product.id}`} className="block aspect-square bg-gray-50">
        <Image
          src={product.image_url || "/images/placeholder.svg"}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-500">
          {product.category}
        </span>
        <Link
          href={`/product/${product.id}`}
          className="line-clamp-1 font-semibold text-gray-900 hover:text-indigo-600"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-lg font-bold text-gray-900">
          ৳{Number(product.price).toLocaleString()}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-3">
          <Link
            href={`/product/${product.id}`}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Details
          </Link>
          <button
            onClick={handleAddToCart}
            className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
