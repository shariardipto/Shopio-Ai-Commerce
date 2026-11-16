// Small coloured label for order status and payment status.
const STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-blue-50 text-blue-700 ring-blue-200",
  completed: "bg-green-50 text-green-700 ring-green-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  paid_demo: "bg-green-50 text-green-700 ring-green-200",
};

const DOTS = {
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
  paid_demo: "bg-green-500",
};

const LABELS = {
  paid_demo: "Paid (Demo)",
};

export default function StatusBadge({ status }) {
  const label = LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${
        STYLES[status] || "bg-gray-50 text-gray-700 ring-gray-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[status] || "bg-gray-400"}`} />
      {label}
    </span>
  );
}
