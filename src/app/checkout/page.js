import CheckoutForm from "@/components/CheckoutForm";
import Icon from "@/components/Icon";
import { requireUser } from "@/lib/auth";
import { getPaymentSettings } from "@/lib/settings";

export const metadata = { title: "Checkout" };

const STEPS = ["Cart", "Checkout", "Done"];

export default async function CheckoutPage() {
  // Logged-out users are sent to /login and come back here afterwards.
  const [{ user, profile }, paymentSettings] = await Promise.all([
    requireUser("/checkout"),
    getPaymentSettings(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Checkout</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            <Icon name="lock" className="h-4 w-4" /> Secure checkout
          </p>
        </div>

        {/* Progress steps */}
        <ol className="flex items-center gap-2 text-sm">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0
                    ? "bg-green-500 text-white"
                    : index === 1
                      ? "bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {index === 0 ? <Icon name="check" className="h-4 w-4" strokeWidth={3} /> : index + 1}
              </span>
              <span className={index === 1 ? "font-semibold text-gray-900" : "text-gray-500"}>{step}</span>
              {index < STEPS.length - 1 && <span className="h-px w-6 bg-gray-300" />}
            </li>
          ))}
        </ol>
      </div>

      <CheckoutForm
        defaultName={profile?.full_name || ""}
        defaultEmail={profile?.email || user.email}
        paymentSettings={paymentSettings}
      />
    </div>
  );
}
