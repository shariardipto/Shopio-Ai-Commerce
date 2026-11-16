import Link from "next/link";
import Icon from "@/components/Icon";
import OrderProgress from "@/components/OrderProgress";
import PaymentInfo from "@/components/PaymentInfo";
import StatusBadge from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { formatDate, formatPrice, shortOrderId } from "@/lib/shop";

export const metadata = { title: "My Orders" };

export default async function MyOrdersPage() {
  const { supabase, user } = await requireUser("/my-orders");

  // RLS also makes sure customers can only ever read their own orders.
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, created_at, subtotal, shipping_fee, total, payment_method, payment_status, order_status, account_last4, payment_reference, address, order_items(id, product_name, price, quantity)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">My Orders</h1>
      <p className="mt-1 text-gray-500">Track the status of your orders.</p>

      {error && <p className="alert-error mt-6">Could not load your orders. Please try again.</p>}

      {!error && orders.length === 0 && (
        <div className="py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-50 to-violet-100 text-indigo-600">
            <Icon name="package" className="h-10 w-10" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-900">You have no orders yet.</p>
          <p className="mt-1 text-gray-500">When you place an order, it will appear here.</p>
          <Link href="/" className="btn-primary mt-6">
            Start Shopping
          </Link>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-5">
        {orders?.map((order, index) => (
          <article
            key={order.id}
            className="card animate-fade-up overflow-hidden"
            style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-4">
              <div>
                <p className="font-mono text-sm font-bold text-gray-900">{shortOrderId(order.id)}</p>
                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</p>
                <p className="text-xs text-gray-500">
                  {order.order_items.length} {order.order_items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <OrderProgress status={order.order_status} />

              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-gray-500">Payment Method</dt>
                  <dd><PaymentInfo order={order} /></dd>
                </div>
                <div>
                  <dt className="text-gray-500">Payment Status</dt>
                  <dd className="mt-0.5"><StatusBadge status={order.payment_status} /></dd>
                </div>
                <div>
                  <dt className="text-gray-500">Order Status</dt>
                  <dd className="mt-0.5"><StatusBadge status={order.order_status} /></dd>
                </div>
              </dl>

              <details className="group rounded-xl border border-gray-100">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-indigo-600 select-none">
                  View items ({order.order_items.length})
                  <Icon name="chevronRight" className="h-4 w-4 transition group-open:rotate-90" />
                </summary>
                <div className="border-t border-gray-100 px-4 pb-4">
                  <ul className="divide-y divide-gray-100 text-sm">
                    {order.order_items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-4 py-2.5">
                        <span className="text-gray-700">
                          {item.product_name} <span className="text-gray-400">× {item.quantity}</span>
                        </span>
                        <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-1 border-t border-gray-100 pt-2 text-sm text-gray-600">
                    <p className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></p>
                    <p className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shipping_fee)}</span></p>
                    <p className="flex items-start gap-1.5 pt-2 text-gray-500">
                      <Icon name="truck" className="mt-0.5 h-4 w-4 shrink-0" /> {order.address}
                    </p>
                  </div>
                </div>
              </details>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
