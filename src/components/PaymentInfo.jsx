import { MOBILE_WALLETS, PAYMENT_METHOD_LABELS } from "@/lib/shop";

// Shows how an order was paid, e.g. "bKash •••• 5678" + "TrxID: 9BC4D7E2F1".
export default function PaymentInfo({ order }) {
  const wallet = MOBILE_WALLETS.find((item) => item.value === order.payment_method);

  return (
    <div>
      <p className="font-semibold whitespace-nowrap text-gray-900" style={wallet ? { color: wallet.color } : undefined}>
        {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
        {order.account_last4 && <span className="font-normal text-gray-500"> •••• {order.account_last4}</span>}
      </p>
      {order.payment_reference && (
        <p className="font-mono text-xs text-gray-500">
          {wallet ? "TrxID" : "Ref"}: {order.payment_reference}
        </p>
      )}
    </div>
  );
}
