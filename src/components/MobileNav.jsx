"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { getCartCount, useCart } from "@/lib/cart";

// Bottom tab bar for phones, easy to reach with your thumb. Hidden on tablets and desktop.
export default function MobileNav({ user }) {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = getCartCount(items);

  const tabs = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/cart", label: "Cart", icon: "cart", badge: cartCount },
    user
      ? { href: "/my-orders", label: "Orders", icon: "package" }
      : { href: "/login", label: "Login", icon: "user" },
  ];
  if (user?.isAdmin) tabs.push({ href: "/admin", label: "Admin", icon: "grid" });

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
    >
      <div className={`grid h-16 ${tabs.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${
                active ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              <span
                className={`relative flex h-8 w-14 items-center justify-center rounded-full transition ${
                  active ? "bg-indigo-50" : ""
                }`}
              >
                <Icon name={tab.icon} className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
                {tab.badge > 0 && (
                  <span
                    key={tab.badge}
                    className="absolute -top-0.5 right-2 flex h-4.5 min-w-4.5 animate-pop items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white ring-2 ring-white"
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
