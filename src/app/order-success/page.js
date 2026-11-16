import Link from "next/link";
import Icon from "@/components/Icon";
import { isUuid, shortOrderId } from "@/lib/shop";

export const metadata = { title: "Order Placed" };

export default async function OrderSuccessPage({ searchParams }) {
  const { id } = await searchParams;

  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-green-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-lg px-4 py-16 sm:py-24">
        <div className="card animate-scale-in p-8 text-center sm:p-10">
          <div className="relative mx-auto h-20 w-20">
            <span className="absolute inset-0 animate-ping rounded-full bg-green-400/30 [animation-iteration-count:2]" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-emerald-600 text-4xl text-white shadow-lg shadow-green-500/30">
              ✓
            </span>
          </div>

          <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Order Placed Successfully
          </h1>
          <p className="mt-2 text-gray-600">Thank you for shopping with Shopio.</p>

          {isUuid(id) && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-600">
              Order ID <span className="font-mono font-semibold text-gray-900">{shortOrderId(id)}</span>
            </p>
          )}

          <div className="mt-8 grid gap-3 rounded-2xl bg-gray-50 p-4 text-left text-sm sm:grid-cols-2">
            <p className="flex items-center gap-2 text-gray-600">
              <Icon name="package" className="h-5 w-5 text-indigo-600" /> We&apos;re preparing your order
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <Icon name="truck" className="h-5 w-5 text-indigo-600" /> Track it in My Orders
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/my-orders" className="btn-primary">
              View My Orders <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
            <Link href="/" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
