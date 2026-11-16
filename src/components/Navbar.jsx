"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import { createClient } from "@/utils/supabase/client";
import { getCartCount, useCart } from "@/lib/cart";

export default function Navbar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const { items } = useCart();
  const [loggingOut, setLoggingOut] = useState(false);

  const cartCount = getCartCount(items);

  const links = [
    { href: "/", label: "Home" },
    { href: "/cart", label: "Cart" },
  ];
  if (user) links.push({ href: "/my-orders", label: "My Orders" });
  if (user?.isAdmin) links.push({ href: "/admin", label: "Admin" });

  function isActive(href) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setLoggingOut(false);
    router.push("/");
    router.refresh();
  }

  function linkClass(href) {
    return `rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition ${
      isActive(href)
        ? "bg-indigo-50 text-indigo-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Cart icon with live item count */}
          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
          >
            <Icon name="cart" className="h-5 w-5" />
            {cartCount > 0 && (
              <span
                key={cartCount}
                className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-linear-to-r from-indigo-600 to-violet-600 px-1 text-[11px] font-bold text-white ring-2 ring-white"
              >
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1 sm:pr-3" title={user.email}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white uppercase">
                  {user.name.charAt(0)}
                </span>
                <span className="hidden max-w-32 truncate text-sm font-medium text-gray-700 sm:inline">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn-ghost h-10 px-3"
                title="Logout"
              >
                <Icon name="logout" className="h-5 w-5" />
                <span className="hidden lg:inline">{loggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost px-3">
                Login
              </Link>
              <Link href="/signup" className="btn-primary px-4">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile: links in a scrollable row */}
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass(link.href)}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
