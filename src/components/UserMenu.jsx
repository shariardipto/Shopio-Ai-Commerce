"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { createClient } from "@/utils/supabase/client";

function Avatar({ name, large = false }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 font-bold text-white uppercase shadow-sm ${
        large ? "h-11 w-11 text-base" : "h-8 w-8 text-sm"
      }`}
    >
      {name.charAt(0)}
    </span>
  );
}

/*
  Account menu in the navbar: one button (avatar + first name) that opens a
  dropdown with the user's details, My Orders, Admin Dashboard (admins only)
  and Logout. Closes when clicking outside, pressing Escape or choosing an item.
*/
export default function UserMenu({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handlePointer(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setLoggingOut(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const firstName = user.name.split(" ")[0];
  const links = [
    { href: "/my-orders", label: "My Orders", icon: "package" },
    ...(user.isAdmin ? [{ href: "/admin", label: "Admin Dashboard", icon: "grid" }] : []),
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`flex h-10 items-center gap-2 rounded-full border bg-white p-1 transition sm:pr-2.5 ${
          open ? "border-indigo-300 ring-4 ring-indigo-100" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
        }`}
      >
        <Avatar name={user.name} />
        <span className="hidden max-w-28 truncate text-sm font-semibold text-gray-800 sm:block">{firstName}</span>
        <svg
          className={`hidden h-4 w-4 text-gray-400 transition sm:block ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-64 origin-top-right animate-scale-in overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10"
        >
          {/* Who is logged in */}
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 p-4">
            <Avatar name={user.name} large />
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{user.name}</p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
              {user.isAdmin && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-violet-700 uppercase">
                  <Icon name="shield" className="h-3 w-3" strokeWidth={2.2} /> Admin
                </span>
              )}
            </div>
          </div>

          <div className="p-1.5">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon name={link.icon} className="h-4.5 w-4.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-100 p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              <Icon name="logout" className="h-4.5 w-4.5" />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
