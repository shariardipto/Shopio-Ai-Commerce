"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

export default function AddToCartButton({ product }) {
  const [added, setAdded] = useState(false);

  function handleClick() {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      disabled={product.stock <= 0}
      className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      {product.stock <= 0 ? "Out of Stock" : added ? "Added to Cart" : "Add to Cart"}
    </button>
  );
}
