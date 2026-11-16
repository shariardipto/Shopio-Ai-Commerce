import Link from "next/link";
import AccessDenied from "@/components/AccessDenied";
import Icon from "@/components/Icon";
import OrderStatusSelect from "@/components/OrderStatusSelect";
import PaymentInfo from "@/components/PaymentInfo";
import StatusBadge from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { ORDER_STATUSES, capitalize, formatDate, formatPrice, shortOrderId } from "@/lib/shop";

export const metadata = { title: "Manage Orders" };

export default async function AdminOrdersPage({ searchParams }) {
  const { supabase, isAdmin } = await requireUser("/admin/orders");
  if (!isAdmin) return <AccessDenied />;

  // Optional filter from the tabs: /admin/orders?status=pending
  const { status } = await searchParams;
  const activeStatus = ORDER_STATUSES.includes(status) ? status : "all";

  // Admins can read all orders (allowed by the RLS policy using is_admin()).
  let query = supabase
    .from("orders")
    .select(
      "id, created_at, full_name, email, phone, address, total, payment_method, payment_status, order_status, account_last4, payment_reference, order_items(id, product_name, quantity)"
    )
    .order("created_at", { ascending: false });
  if (activeStatus !== "all") query = query.eq("order_status", activeStatus);
  const { data: orders, error } = await query;

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Orders</h1>
      <p className="mt-1 text-gray-600">Update order status as you prepare and deliver orders.</p>

      {/* Status filter tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {["all", ...ORDER_STATUSES].map((tab) => (
          <Link
            key={tab}
            href={tab === "all" ? "/admin/orders" : `/admin/orders?status=${tab}`}
            className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
              activeStatus === tab
                ? "bg-gray-900 text-white shadow-md"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab === "all" ? "All Orders" : capitalize(tab)}
          </Link>
        ))}
      </div>

      {error && <p className="alert-error mt-6">Could not load orders.</p>}

      {orders?.length === 0 && (
        <div className="card mt-6 py-16 text-center">
          <Icon name="list" className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">
            {activeStatus === "all" ? "No orders yet." : `No ${activeStatus} orders.`}
          </p>
        </div>
      )}

      {orders?.length > 0 && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-230 text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50/80 text-xs tracking-wide text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Order</th>
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold">Total</th>
                <th className="px-5 py-3.5 font-semibold">Payment</th>
                <th className="px-5 py-3.5 font-semibold">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 align-top">
              {orders.map((order) => (
                <tr key={order.id} className="transition hover:bg-indigo-50/30">
                  <td className="px-5 py-4">
                    <p className="font-mono font-bold text-gray-900">{shortOrderId(order.id)}</p>
                    <details className="group mt-1">
                      <summary className="flex cursor-pointer items-center gap-1 text-xs font-medium text-indigo-600 select-none">
                        {order.order_items.length} item(s)
                        <Icon name="chevronRight" className="h-3 w-3 transition group-open:rotate-90" />
                      </summary>
                      <ul className="mt-1.5 space-y-0.5 text-xs text-gray-600">
                        {order.order_items.map((item) => (
                          <li key={item.id}>
                            {item.product_name} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                  <td className="max-w-60 px-5 py-4">
                    <p className="font-semibold text-gray-900">{order.full_name}</p>
                    <p className="truncate text-xs text-gray-500">{order.email}</p>
                    <p className="text-xs text-gray-500">{order.phone}</p>
                    <p className="mt-1 text-xs text-gray-400">{order.address}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-gray-600">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-4 font-bold whitespace-nowrap text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-5 py-4">
                    <PaymentInfo order={order} />
                    <div className="mt-1.5">
                      <StatusBadge status={order.payment_status} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusSelect orderId={order.id} status={order.order_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
