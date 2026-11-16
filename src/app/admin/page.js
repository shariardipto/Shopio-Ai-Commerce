import Link from "next/link";
import AccessDenied from "@/components/AccessDenied";
import Icon from "@/components/Icon";
import StatusBadge from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { formatDate, formatPrice, shortOrderId } from "@/lib/shop";

export const metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  const { supabase, isAdmin, profile } = await requireUser("/admin");
  if (!isAdmin) return <AccessDenied />;

  // All four queries run at the same time. head: true -> only count rows, do not download them.
  const [products, orders, pendingOrders, recent] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status", "pending"),
    supabase
      .from("orders")
      .select("id, created_at, full_name, total, order_status")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Total Products", value: products.count ?? 0, icon: "package", color: "from-indigo-500 to-violet-500", href: "/admin/products" },
    { label: "Total Orders", value: orders.count ?? 0, icon: "list", color: "from-sky-500 to-blue-600", href: "/admin/orders" },
    { label: "Pending Orders", value: pendingOrders.count ?? 0, icon: "clock", color: "from-amber-400 to-orange-500", href: "/admin/orders?status=pending" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Shopio Admin</h1>
      <p className="mt-1 text-gray-600">
        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}. Here&apos;s what&apos;s happening in your store.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card group animate-fade-up p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${stat.color} text-white shadow-md`}>
                <Icon name={stat.icon} className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900">{stat.value}</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-indigo-600 opacity-0 transition group-hover:opacity-100">
              View <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/admin/products" className="btn-primary">
          <Icon name="package" className="h-4 w-4" /> Manage Products
        </Link>
        <Link href="/admin/orders" className="btn-secondary">
          <Icon name="list" className="h-4 w-4" /> View Orders
        </Link>
        <Link href="/" className="btn-secondary">
          <Icon name="store" className="h-4 w-4" /> Go to Store
        </Link>
      </div>

      <section className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        {recent.data?.length ? (
          <ul className="divide-y divide-gray-100">
            {recent.data.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-gray-900">{shortOrderId(order.id)}</p>
                  <p className="truncate text-xs text-gray-500">
                    {order.full_name} · {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.order_status} />
                  <span className="w-24 text-right font-semibold text-gray-900">{formatPrice(order.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-10 text-center text-sm text-gray-500">No orders yet.</p>
        )}
      </section>
    </div>
  );
}
