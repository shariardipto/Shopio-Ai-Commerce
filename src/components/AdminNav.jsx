"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/products", label: "Products", icon: "package" },
  { href: "/admin/orders", label: "Orders", icon: "list" },
  { href: "/admin/payments", label: "Payments", icon: "cash" },
  { href: "/admin/users", label: "Users", icon: "user" },
];

// Admin menu with the current page highlighted.
export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex items-center gap-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
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
  );
}
