import { MOBILE_WALLETS, getEnabledMethods } from "@/lib/shop";

// "We accept" row. Shows only the payment methods the admin has turned on.
const OTHER_BADGES = {
  cod: [{ label: "COD", className: "text-green-700" }],
  card: [
    { label: "VISA", className: "text-blue-800 italic" },
    { label: "Mastercard", className: "text-orange-600" },
  ],
  bank: [{ label: "Bank", className: "text-gray-700" }],
};

export default function PaymentBadges({ settings, className = "" }) {
  const badge = "rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-extrabold tracking-tight";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {getEnabledMethods(settings).flatMap((method) => {
        const wallet = MOBILE_WALLETS.find((item) => item.value === method);
        if (wallet) {
          return (
            <span key={method} className={badge} style={{ color: wallet.color }}>
              {wallet.label}
            </span>
          );
        }
        return OTHER_BADGES[method].map((item) => (
          <span key={item.label} className={`${badge} ${item.className}`}>
            {item.label}
          </span>
        ));
      })}
    </div>
  );
}
