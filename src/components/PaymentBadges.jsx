import { MOBILE_WALLETS } from "@/lib/shop";

// "We accept" row: Cash on Delivery, bKash, Nagad, Rocket, Visa, Mastercard, Bank.
const OTHERS = [
  { label: "VISA", className: "text-blue-800 italic" },
  { label: "Mastercard", className: "text-orange-600" },
  { label: "Bank", className: "text-gray-700" },
];

export default function PaymentBadges({ className = "" }) {
  const badge = "rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-extrabold tracking-tight";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className={`${badge} text-green-700`}>COD</span>
      {MOBILE_WALLETS.map((wallet) => (
        <span key={wallet.value} className={badge} style={{ color: wallet.color }}>
          {wallet.label}
        </span>
      ))}
      {OTHERS.map((item) => (
        <span key={item.label} className={`${badge} ${item.className}`}>
          {item.label}
        </span>
      ))}
    </div>
  );
}
