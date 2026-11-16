import Icon from "@/components/Icon";

const STEPS = [
  { status: "pending", label: "Placed", icon: "clock" },
  { status: "processing", label: "Processing", icon: "package" },
  { status: "completed", label: "Completed", icon: "check" },
];

// Simple order tracker: Placed -> Processing -> Completed (or a red "Cancelled" note).
export default function OrderProgress({ status }) {
  if (status === "cancelled") {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
        <Icon name="x" className="h-4 w-4" /> This order was cancelled.
      </p>
    );
  }

  const current = Math.max(0, STEPS.findIndex((step) => step.status === status));

  return (
    <ol className="flex items-center" aria-label={`Order status: ${status}`}>
      {STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step.status} className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  done
                    ? "bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Icon name={step.icon} className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className={`text-xs font-medium ${done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <span className="mx-2 mb-5 h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                <span
                  className={`block h-full rounded-full bg-linear-to-r from-indigo-600 to-violet-600 transition-all duration-700 ${
                    index < current ? "w-full" : "w-0"
                  }`}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
