import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import { PLACEHOLDER_IMAGE, formatPrice } from "@/lib/shop";

function RemoveButton({ name, onRemove, className = "" }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${name}`}
      title="Remove"
      className={`items-center gap-1 rounded-lg p-2 text-sm font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-600 ${className}`}
    >
      <Icon name="trash" className="h-4 w-4" />
      <span className="hidden sm:inline">Remove</span>
    </button>
  );
}

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex animate-fade-up gap-3 py-4 sm:gap-4 sm:py-5">
      <Link href={`/product/${item.id}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-24 sm:w-24">
        <Image
          src={item.image_url || PLACEHOLDER_IMAGE}
          alt={item.name}
          width={96}
          height={96}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
        {/* Name + unit price (phones: remove button on the right) */}
        <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/product/${item.id}`} className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-indigo-600 sm:line-clamp-1 sm:text-base">
              {item.name}
            </Link>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{formatPrice(item.price)} each</p>
          </div>
          <RemoveButton name={item.name} onRemove={onRemove} className="-mt-1 -mr-2 flex sm:hidden" />
        </div>

        {/* Quantity + line total (desktop: remove button at the end) */}
        <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
          <div className="flex items-center rounded-xl border border-gray-200 bg-white">
            <button
              type="button"
              onClick={onDecrease}
              disabled={item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.name}`}
              className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:text-indigo-600 disabled:text-gray-300 sm:h-9 sm:w-9"
            >
              <Icon name="minus" className="h-4 w-4" />
            </button>
            <span className="w-7 text-center text-sm font-semibold sm:w-8">{item.quantity}</span>
            <button
              type="button"
              onClick={onIncrease}
              aria-label={`Increase quantity of ${item.name}`}
              className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:text-indigo-600 sm:h-9 sm:w-9"
            >
              <Icon name="plus" className="h-4 w-4" />
            </button>
          </div>

          <p className="text-right font-bold text-gray-900 sm:w-24">{formatPrice(item.price * item.quantity)}</p>

          <RemoveButton name={item.name} onRemove={onRemove} className="hidden sm:flex" />
        </div>
      </div>
    </div>
  );
}
