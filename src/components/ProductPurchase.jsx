"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/Icon";
import { addToCart } from "@/lib/cart";

// Quantity selector + "Add to Cart" + "Buy Now" on the product details page.
export default function ProductPurchase({ product }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const maxQuantity = Math.min(product.stock, 99);

  if (product.stock <= 0) {
    return (
      <button type="button" disabled className="btn-secondary mt-8 w-full bg-gray-100 py-3.5 text-gray-500 sm:w-auto sm:px-10">
        Out of Stock
      </button>
    );
  }

  function handleAdd() {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addToCart(product, quantity);
    router.push("/checkout");
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <div className="flex shrink-0 items-center rounded-xl border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="flex h-12 w-12 items-center justify-center text-gray-600 transition hover:text-indigo-600 disabled:text-gray-300"
        >
          <Icon name="minus" className="h-4 w-4" />
        </button>
        <span className="w-10 text-center font-semibold text-gray-900" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          disabled={quantity >= maxQuantity}
          aria-label="Increase quantity"
          className="flex h-12 w-12 items-center justify-center text-gray-600 transition hover:text-indigo-600 disabled:text-gray-300"
        >
          <Icon name="plus" className="h-4 w-4" />
        </button>
      </div>

      <button type="button" onClick={handleAdd} className="btn-primary min-w-40 flex-1 py-3.5">
        {added ? (
          <>
            <Icon name="check" className="h-5 w-5" strokeWidth={2.5} /> Added to Cart
          </>
        ) : (
          <>
            <Icon name="cart" className="h-5 w-5" /> Add to Cart
          </>
        )}
      </button>
      <button type="button" onClick={handleBuyNow} className="btn-secondary basis-full py-3.5 sm:basis-auto sm:flex-1">
        Buy Now
        <Icon name="arrowRight" className="h-4 w-4" />
      </button>
    </div>
  );
}
