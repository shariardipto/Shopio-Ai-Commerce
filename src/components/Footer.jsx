import Link from "next/link";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import PaymentBadges from "@/components/PaymentBadges";
import { SHIPPING_FEE, formatPrice } from "@/lib/shop";

// Site footer shown on every page (rendered by the root layout).
export default function Footer({ user, paymentSettings }) {
  const accountLinks = user
    ? [
        { href: "/my-orders", label: "My Orders" },
        { href: "/cart", label: "Cart" },
        ...(user.isAdmin ? [{ href: "/admin", label: "Admin Dashboard" }] : []),
      ]
    : [
        { href: "/login", label: "Login" },
        { href: "/signup", label: "Sign Up" },
        { href: "/cart", label: "Cart" },
      ];

  const columns = [
    {
      title: "Shop",
      links: [
        { href: "/", label: "Home" },
        { href: "/#search", label: "Search Products" },
        { href: "/#search", label: "AI Image & Camera Search" },
      ],
    },
    { title: "Account", links: accountLinks },
  ];

  const highlights = [
    { icon: "sparkles", text: "Search by text, photo or camera" },
    { icon: "cash", text: "Easy & flexible payment options" },
    { icon: "truck", text: `Delivery all over Bangladesh · ${formatPrice(SHIPPING_FEE)}` },
    { icon: "shield", text: "Secure login with Supabase" },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-10 sm:py-12 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            AI-powered single-vendor shopping. Find products by typing a name, uploading a photo or
            using your camera.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold text-gray-900">{column.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-600 transition hover:text-indigo-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-900">Why Shopio</h2>
          <ul className="mt-4 space-y-2.5">
            {highlights.map((item) => (
              <li key={item.text} className="flex items-center gap-2.5 text-sm text-gray-600">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Shopio. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-gray-600">We accept:</span>
            <PaymentBadges settings={paymentSettings} />
          </div>
        </div>
      </div>
    </footer>
  );
}
