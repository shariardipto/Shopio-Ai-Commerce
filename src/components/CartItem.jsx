"use client";

import Image from "next/image";

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 py-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-50">
        <Image
          src={item.image_url || "/images/placeholder.svg"}
          alt={item.name}
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex-1">
        <p className="font-medium text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-500">৳{Number(item.price).toLocaleString()}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onDecrease}
          className="h-8 w-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          -
        </button>
        <span className="w-6 text-center">{item.quantity}</span>
        <button
          onClick={onIncrease}
          className="h-8 w-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          +
        </button>
      </div>

      <p className="w-24 text-right font-semibold text-gray-900">
        ৳{Number(item.price * item.quantity).toLocaleString()}
      </p>

      <button onClick={onRemove} className="text-sm font-medium text-red-500 hover:text-red-700">
        Remove
      </button>
    </div>
  );
}
