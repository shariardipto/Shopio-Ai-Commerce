"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { addToCart } from "@/lib/cart";

// Used on product cards. Shows a short "Added" tick after clicking.
export default function AddToCartButton({ product, className = "" }) {
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleClick() {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (outOfStock) {
    return (
      <button type="button" disabled className={`btn-secondary bg-gray-100 text-gray-500 ${className}`}>
        Out of Stock
      </button>
    );
  }

  return (
    <button type="button" onClick={handleClick} className={`btn-primary ${className}`}>
      {added ? (
        <>
          <Icon name="check" className="h-4 w-4" strokeWidth={2.5} /> Added
        </>
      ) : (
        <>
          <Icon name="cart" className="h-4 w-4" /> Add to Cart
        </>
      )}
    </button>
  );
}
