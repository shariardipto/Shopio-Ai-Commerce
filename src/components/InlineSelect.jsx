"use client";

import { useState, useTransition } from "react";

/*
  Small dropdown used in admin tables (order status, payment status, user role).
  It saves immediately by calling `action(newValue)`, a Server Action.
  Optional: ask "Are you sure?" before saving one particular value.
*/
export default function InlineSelect({ action, value, options, label, confirmValue, confirmMessage, disabled = false }) {
  const [current, setCurrent] = useState(value);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(event) {
    const previous = current;
    const next = event.target.value;
    if (next === confirmValue && confirmMessage && !window.confirm(confirmMessage)) return;

    setCurrent(next);
    setMessage("");
    startTransition(async () => {
      const result = await action(next);
      if (result?.error) {
        setCurrent(previous);
        setMessage(result.error);
      } else {
        setMessage("Saved ✓");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={current}
        onChange={handleChange}
        disabled={disabled || isPending}
        aria-label={label}
        className="input w-40 py-1.5"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(isPending || message) && (
        <span className={`max-w-40 text-xs ${isPending || message.startsWith("Saved") ? "text-gray-500" : "text-red-600"}`}>
          {isPending ? "Saving..." : message}
        </span>
      )}
    </div>
  );
}
