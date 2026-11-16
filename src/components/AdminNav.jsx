"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";

const LINKS = [
  { href: "/admin", label: "Dashboard", short: "Home", icon: "grid" },
  { href: "/admin/products", label: "Products", short: "Products", icon: "package" },
  { href: "/admin/orders", label: "Orders", short: "Orders", icon: "list" },
  { href: "/admin/payments", label: "Payments", short: "Payments", icon: "cash" },
  { href: "/admin/users", label: "Users", short: "Users", icon: "user" },
];

/*
  Admin menu with the current page highlighted.
  Phones: 5 icon tabs in one row (all visible, no sideways scrolling).
  Tablet / desktop: a tab bar with a "Go to Store" link on the right.
*/
export default function AdminNav() {
  const pathname = usePathname();
  const isActive = (href) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      {/* Phones */}
      <nav
        aria-label="Admin"
        className="mb-6 grid grid-cols-5 gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm md:hidden"
      >
        {LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition ${
                active
                  ? "bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-gray-600 active:bg-gray-100"
              }`}
            >
              <Icon name={link.icon} className="h-5 w-5" />
              {link.short}
            </Link>
          );
        })}
      </nav>

      {/* Tablet / desktop */}
      <nav
        aria-label="Admin"
        className="mb-8 hidden items-center gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm md:flex"
      >
        {LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                active
                  ? "bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon name={link.icon} className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="ml-auto flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <Icon name="store" className="h-4 w-4" />
          Go to Store
        </Link>
      </nav>
    </>
  );
}
