"use client";

import Link from "next/link";
import CartItem from "@/components/CartItem";
import Icon from "@/components/Icon";
import { getCartCount, getCartSubtotal, removeFromCart, updateQuantity, useCart } from "@/lib/cart";
import { SHIPPING_FEE, formatPrice } from "@/lib/shop";

export default function CartPage() {
  const { items, ready } = useCart();

  // The cart lives in localStorage, which only exists in the browser.
  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10" aria-busy="true" aria-label="Loading cart">
        <div className="skeleton h-8 w-48" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="skeleton h-72 rounded-2xl lg:col-span-2" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 animate-scale-in items-center justify-center rounded-3xl bg-linear-to-br from-indigo-50 to-violet-100 text-indigo-600">
          <Icon name="cart" className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Your cart is empty.</h1>
        <p className="mt-2 text-gray-600">Find something you like and add it to your cart.</p>
        <Link href="/" className="btn-primary mt-8">
          Start Shopping <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const subtotal = getCartSubtotal(items);
  const count = getCartCount(items);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Shopping Cart</h1>
      <p className="mt-1 text-gray-500">
        {count} {count === 1 ? "item" : "items"} in your cart
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">
        <div className="card divide-y divide-gray-100 px-4 sm:px-6 lg:col-span-2">
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

        <aside className="card p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <dt>Subtotal</dt>
              <dd className="font-medium text-gray-900">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-gray-600">
              <dt>Shipping</dt>
              <dd className="font-medium text-gray-900">{formatPrice(SHIPPING_FEE)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
              <dt>Estimated Total</dt>
              <dd>{formatPrice(subtotal + SHIPPING_FEE)}</dd>
            </div>
          </dl>

          <Link href="/checkout" className="btn-primary mt-6 w-full py-3.5">
            Proceed to Checkout <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
          <Link href="/" className="btn-ghost mt-2 w-full">
            Continue Shopping
          </Link>

          <ul className="mt-6 space-y-2 border-t border-gray-100 pt-5 text-xs text-gray-500">
            <li className="flex items-center gap-2"><Icon name="shield" className="h-4 w-4 text-green-600" /> Secure checkout</li>
            <li className="flex items-center gap-2"><Icon name="cash" className="h-4 w-4 text-green-600" /> Cash on Delivery, bKash, Nagad, Rocket & card</li>
            <li className="flex items-center gap-2"><Icon name="truck" className="h-4 w-4 text-green-600" /> Delivery all over Bangladesh</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
