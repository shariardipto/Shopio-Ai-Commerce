"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { CART_ADDED_EVENT } from "@/lib/cart";
import { PLACEHOLDER_IMAGE } from "@/lib/shop";

// Small popup in the corner that confirms "Added to cart" for 3 seconds.
export default function CartToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    function handleAdded(event) {
      clearTimeout(timerRef.current);
      setToast({ ...event.detail, id: Date.now() });
      timerRef.current = setTimeout(() => setToast(null), 3000);
    }
    window.addEventListener(CART_ADDED_EVENT, handleAdded);
    return () => {
      window.removeEventListener(CART_ADDED_EVENT, handleAdded);
      clearTimeout(timerRef.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm animate-slide-up items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl shadow-gray-900/10 sm:right-6 sm:bottom-6 sm:left-auto sm:mx-0"
    >
      <Image
        src={toast.image_url || PLACEHOLDER_IMAGE}
        alt=""
        width={48}
        height={48}
        className="h-12 w-12 shrink-0 rounded-xl bg-gray-100 object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-sm font-semibold text-green-600">
          <Icon name="check" className="h-4 w-4" strokeWidth={2.5} /> Added to cart
        </p>
        <p className="truncate text-sm text-gray-600">{toast.name}</p>
      </div>
      <Link href="/cart" onClick={() => setToast(null)} className="btn-secondary px-3 py-2 text-xs">
        View Cart
      </Link>
    </div>
  );
}
