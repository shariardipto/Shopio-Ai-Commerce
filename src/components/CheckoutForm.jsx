"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { placeOrder } from "@/app/checkout/actions";
import Icon from "@/components/Icon";
import PaymentSection, {
  INITIAL_PAYMENT,
  SectionTitle,
  getPaymentDetails,
  validatePayment,
} from "@/components/PaymentSection";
import { clearCart, useCart } from "@/lib/cart";
import { BD_DIVISIONS, PLACEHOLDER_IMAGE, SHIPPING_FEE, formatPrice, normalizeBdPhone } from "@/lib/shop";
import { createClient } from "@/utils/supabase/client";

export default function CheckoutForm({ defaultName, defaultEmail }) {
  const router = useRouter();
  const { items, ready } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [latestProducts, setLatestProducts] = useState(null);
  const [payment, setPayment] = useState(INITIAL_PAYMENT);

  const [details, setDetails] = useState({
    fullName: defaultName,
    email: defaultEmail,
    phone: "",
    division: "",
    city: "",
    street: "",
  });

  // Load the latest price/stock of the cart products from Supabase,
  // so the summary shows the same total the server will charge.
  const productIds = items.map((item) => item.id).join(",");
  useEffect(() => {
    if (!productIds) return;
    let active = true;
    const supabase = createClient();
    supabase
      .from("products")
      .select("id, name, price, image_url, stock")
      .in("id", productIds.split(","))
      .then(({ data }) => {
        if (active && data) setLatestProducts(Object.fromEntries(data.map((p) => [p.id, p])));
      });
    return () => {
      active = false;
    };
  }, [productIds]);

  const lines = items.map((item) => {
    const latest = latestProducts?.[item.id];
    return {
      ...item,
      name: latest?.name ?? item.name,
      price: Number(latest?.price ?? item.price),
      image_url: latest?.image_url ?? item.image_url,
      unavailable: latestProducts ? !latest || latest.stock <= 0 : false,
    };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const total = subtotal + SHIPPING_FEE;
  const hasUnavailable = lines.some((line) => line.unavailable);

  function updateDetails(e) {
    setDetails({ ...details, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const phone = normalizeBdPhone(details.phone);
    if (!phone) {
      setError("Please enter a valid Bangladeshi mobile number, e.g. 01712345678.");
      return;
    }
    if (!details.division) {
      setError("Please choose your division.");
      return;
    }
    const paymentError = validatePayment(payment);
    if (paymentError) {
      setError(paymentError);
      return;
    }

    startTransition(async () => {
      const result = await placeOrder({
        fullName: details.fullName,
        email: details.email,
        phone,
        // One readable address line: "House 12, Road 5, Dhanmondi, Dhaka, Dhaka Division"
        address: `${details.street.trim()}, ${details.city.trim()}, ${details.division} Division`,
        // Only safe details: method, last 4 digits, TrxID / bank reference.
        ...getPaymentDetails(payment),
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setPlacedOrderId(result.orderId);
      clearCart();
      router.push(`/order-success?id=${result.orderId}`);
    });
  }

  if (placedOrderId) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-600">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
        <p className="mt-4">Order placed! Redirecting...</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="mt-8 grid gap-6 lg:grid-cols-5" aria-busy="true" aria-label="Loading checkout">
        <div className="skeleton h-96 rounded-2xl lg:col-span-3" />
        <div className="skeleton h-80 rounded-2xl lg:col-span-2" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon name="cart" className="h-8 w-8" />
        </div>
        <p className="mt-5 text-lg font-semibold text-gray-900">Your cart is empty.</p>
        <Link href="/" className="btn-primary mt-6">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const isCod = payment.option === "cod";

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid items-start gap-6 lg:grid-cols-5">
      <div className="flex flex-col gap-6 lg:col-span-3">
        {/* 1. Delivery details (Bangladesh) */}
        <section className="card p-6">
          <SectionTitle number="1">Delivery Details</SectionTitle>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="label">Full Name</label>
              <input id="fullName" name="fullName" required autoComplete="name" value={details.fullName} onChange={updateDetails} className="input" />
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" value={details.email} onChange={updateDetails} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="phone" className="label">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-600">
                  🇧🇩 +88
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  autoComplete="tel-national"
                  placeholder="01XXXXXXXXX"
                  value={details.phone}
                  onChange={updateDetails}
                  className="input rounded-l-none font-mono"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">The delivery person will call this number.</p>
            </div>
            <div>
              <label htmlFor="division" className="label">Division</label>
              <select id="division" name="division" required value={details.division} onChange={updateDetails} className="input">
                <option value="" disabled>Select division</option>
                {BD_DIVISIONS.map((division) => (
                  <option key={division} value={division}>{division}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="label">District / City</label>
              <input id="city" name="city" required autoComplete="address-level2" placeholder="e.g. Dhaka, Gazipur" value={details.city} onChange={updateDetails} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="street" className="label">Full Address</label>
              <textarea id="street" name="street" required rows={2} autoComplete="street-address" placeholder="House, road, area / thana (e.g. House 12, Road 5, Dhanmondi)" value={details.street} onChange={updateDetails} className="input" />
            </div>
          </div>
        </section>

        {/* 2. Payment */}
        <PaymentSection payment={payment} onChange={setPayment} total={total} />
      </div>

      {/* Order summary */}
      <aside className="card p-6 lg:sticky lg:top-24 lg:col-span-2">
        <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

        <ul className="mt-4 divide-y divide-gray-100">
          {lines.map((line) => (
            <li key={line.id} className="flex items-center gap-3 py-3">
              <div className="relative shrink-0">
                <Image
                  src={line.image_url || PLACEHOLDER_IMAGE}
                  alt={line.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-xl bg-gray-100 object-cover"
                />
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[11px] font-bold text-white">
                  {line.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{line.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(line.price)} each</p>
                {line.unavailable && <p className="text-xs font-medium text-red-600">No longer available</p>}
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatPrice(line.price * line.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2.5 border-t border-gray-200 pt-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <dt>Subtotal</dt>
            <dd className="font-medium text-gray-900">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-gray-600">
            <dt>Delivery Charge</dt>
            <dd className="font-medium text-gray-900">{formatPrice(SHIPPING_FEE)}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>

        <p className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
          <Icon name="truck" className="h-4 w-4 shrink-0 text-indigo-600" />
          Delivery in 2–5 working days anywhere in Bangladesh.
        </p>

        {hasUnavailable && (
          <p className="alert-error mt-4">
            Some items are no longer available. Please remove them from your{" "}
            <Link href="/cart" className="font-medium underline">cart</Link>.
          </p>
        )}
        {error && <p className="alert-error mt-4 animate-fade-up">{error}</p>}

        <button type="submit" disabled={isPending || hasUnavailable} className="btn-primary mt-6 w-full py-3.5 text-base">
          {isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Placing order...
            </>
          ) : (
            <>
              <Icon name="lock" className="h-4 w-4" />
              {isCod ? `Place Order · ${formatPrice(total)}` : `Pay ${formatPrice(total)} & Place Order`}
            </>
          )}
        </button>
        <p className="mt-3 text-center text-xs text-gray-400">Prices are confirmed by the server when you place the order.</p>
      </aside>
    </form>
  );
}
