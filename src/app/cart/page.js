"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CartItem from "@/components/CartItem";
import { getCart, updateQuantity, removeFromCart, subscribeToCart } from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getCart());
    return subscribeToCart(() => setItems(getCart()));
  }, []);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty.</h1>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

      <div className="mt-6">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
            onRemove={() => removeFromCart(item.id)}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
        <span className="text-lg font-semibold text-gray-900">Subtotal</span>
        <span className="text-lg font-bold text-gray-900">৳{subtotal.toLocaleString()}</span>
      </div>

      <button
        disabled
        title="Checkout will be available in a future update"
        className="mt-6 w-full cursor-not-allowed rounded-md bg-gray-300 px-4 py-3 text-sm font-medium text-gray-600"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
