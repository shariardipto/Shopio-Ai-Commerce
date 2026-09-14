"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getCartCount, subscribeToCart } from "@/lib/cart";

export default function Navbar({ user }) {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCartCount(getCartCount());
    return subscribeToCart(() => setCartCount(getCartCount()));
  }, []);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          SHOPIO
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link href="/" className="hover:text-indigo-600">
            Home
          </Link>
          <Link href="/#search" className="hover:text-indigo-600">
            Search
          </Link>
          <Link href="/cart" className="hover:text-indigo-600">
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="text-sm font-medium text-gray-700 md:hidden">
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-600 sm:inline">
                {user.full_name || user.email}
              </span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
