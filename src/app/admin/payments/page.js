import Link from "next/link";
import { updatePaymentSettings, updatePaymentStatus } from "@/app/admin/actions";
import AccessDenied from "@/components/AccessDenied";
import Icon from "@/components/Icon";
import InlineSelect from "@/components/InlineSelect";
import PaymentInfo from "@/components/PaymentInfo";
import PaymentSettingsForm from "@/components/PaymentSettingsForm";
import { requireUser } from "@/lib/auth";
import { getPaymentSettings } from "@/lib/settings";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  formatDate,
  formatPrice,
  shortOrderId,
} from "@/lib/shop";

export const metadata = { title: "Payments" };

const STATUS_OPTIONS = PAYMENT_STATUSES.map((status) => ({ value: status, label: PAYMENT_STATUS_LABELS[status] }));

export default async function AdminPaymentsPage() {
  const { supabase, isAdmin } = await requireUser("/admin/payments");
  if (!isAdmin) return <AccessDenied />;

  const [settings, { data: orders, error }] = await Promise.all([
    getPaymentSettings(),
    supabase
      .from("orders")
      .select("id, created_at, full_name, total, payment_method, payment_status, account_last4, payment_reference, order_status")
      .order("created_at", { ascending: false }),
  ]);

  const allOrders = orders || [];
  const sum = (list) => list.reduce((total, order) => total + Number(order.total), 0);
  const active = allOrders.filter((order) => order.order_status !== "cancelled");

  const summary = [
    {
      label: "Received",
      value: sum(active.filter((o) => o.payment_status === "paid" || o.payment_status === "paid_demo")),
      icon: "check",
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Awaiting Payment",
      value: sum(active.filter((o) => o.payment_status === "pending")),
      icon: "clock",
      color: "from-amber-400 to-orange-500",
    },
    {
      label: "Failed",
      value: sum(allOrders.filter((o) => o.payment_status === "failed")),
      icon: "x",
      color: "from-rose-500 to-red-600",
    },
  ];

  const byMethod = PAYMENT_METHODS.map((method) => {
    const list = active.filter((order) => order.payment_method === method);
    return { method, count: list.length, amount: sum(list) };
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Payments</h1>
      <p className="mt-1 text-gray-600">Set up payment methods and verify customer payments.</p>

      {error && (
        <p className="alert-error mt-6">
          Could not load payments. Make sure the latest <code>supabase/schema.sql</code> has been run.
        </p>
      )}

      {/* Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {summary.map((item) => (
          <div key={item.label} className="card p-6">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${item.color} text-white shadow-md`}>
                <Icon name={item.icon} className="h-5 w-5" strokeWidth={2.2} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">{formatPrice(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-5">
        {/* Payment method settings */}
        <section className="lg:col-span-3">
          <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
          <p className="mt-1 mb-4 text-sm text-gray-500">
            Turn methods on or off and set your merchant numbers. Customers only see methods that are ON.
          </p>
          <PaymentSettingsForm settings={settings} action={updatePaymentSettings} />
        </section>

        {/* Breakdown by method */}
        <section className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900">By Method</h2>
          <p className="mt-1 mb-4 text-sm text-gray-500">Orders and amount per payment method (excluding cancelled).</p>
          <div className="card divide-y divide-gray-100">
            {byMethod.map((row) => (
              <div key={row.method} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="font-semibold text-gray-900">{PAYMENT_METHOD_LABELS[row.method]}</p>
                  <p className="text-xs text-gray-500">
                    {row.count} {row.count === 1 ? "order" : "orders"}
                    {!settings[`${row.method}_enabled`] && <span className="ml-2 text-gray-400">· OFF</span>}
                  </p>
                </div>
                <p className="font-bold text-gray-900">{formatPrice(row.amount)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Transactions */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <p className="mt-1 text-sm text-gray-500">
              Check the TrxID / reference, then mark the payment as Paid or Failed. Mark COD as Paid after delivery.
            </p>
          </div>
          <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:underline">
            All orders
          </Link>
        </div>

        {allOrders.length === 0 ? (
          <div className="card mt-4 py-14 text-center">
            <Icon name="cash" className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-gray-500">No payments yet.</p>
          </div>
        ) : (
          <div className="card mt-4 overflow-x-auto">
            <table className="w-full min-w-200 text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-xs tracking-wide text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Order</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Method</th>
                  <th className="px-5 py-3.5 font-semibold">Amount</th>
                  <th className="px-5 py-3.5 font-semibold">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 align-top">
                {allOrders.slice(0, 25).map((order) => (
                  <tr key={order.id} className="transition hover:bg-indigo-50/30">
                    <td className="px-5 py-4">
                      <p className="font-mono font-bold text-gray-900">{shortOrderId(order.id)}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-900">{order.full_name}</td>
                    <td className="px-5 py-4">
                      <PaymentInfo order={order} />
                    </td>
                    <td className="px-5 py-4 font-bold whitespace-nowrap text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4">
                      <InlineSelect
                        action={updatePaymentStatus.bind(null, order.id)}
                        value={order.payment_status}
                        options={STATUS_OPTIONS}
                        label="Payment status"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
