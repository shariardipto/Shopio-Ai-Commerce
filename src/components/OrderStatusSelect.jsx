"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES, capitalize } from "@/lib/shop";

// Dropdown on the admin orders page. Saves the new status immediately.
export default function OrderStatusSelect({ orderId, status }) {
  const [value, setValue] = useState(status);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(event) {
    const previous = value;
    const next = event.target.value;
    setValue(next);
    setMessage("");

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (result?.error) {
        setValue(previous);
        setMessage(result.error);
      } else {
        setMessage("Saved ✓");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Order status"
        className="input w-36 py-1.5"
      >
        {ORDER_STATUSES.map((option) => (
          <option key={option} value={option}>
            {capitalize(option)}
          </option>
        ))}
      </select>
      {(isPending || message) && (
        <span className={`text-xs ${message.startsWith("Saved") || isPending ? "text-gray-500" : "text-red-600"}`}>
          {isPending ? "Saving..." : message}
        </span>
      )}
    </div>
  );
}
