import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import { PLACEHOLDER_IMAGE, formatPrice } from "@/lib/shop";

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex animate-fade-up gap-4 py-5">
      <Link href={`/product/${item.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={item.image_url || PLACEHOLDER_IMAGE}
          alt={item.name}
          width={96}
          height={96}
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Link href={`/product/${item.id}`} className="line-clamp-1 font-semibold text-gray-900 hover:text-indigo-600">
            {item.name}
          </Link>
          <p className="mt-0.5 text-sm text-gray-500">{formatPrice(item.price)} each</p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="flex items-center rounded-xl border border-gray-200 bg-white">
            <button
              type="button"
              onClick={onDecrease}
              disabled={item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.name}`}
              className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:text-indigo-600 disabled:text-gray-300"
            >
              <Icon name="minus" className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              type="button"
              onClick={onIncrease}
              aria-label={`Increase quantity of ${item.name}`}
              className="flex h-9 w-9 items-center justify-center text-gray-600 transition hover:text-indigo-600"
            >
              <Icon name="plus" className="h-4 w-4" />
            </button>
          </div>

          <p className="w-24 text-right font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>

          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name}`}
            title="Remove"
            className="flex items-center gap-1 rounded-lg p-2 text-sm font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Icon name="trash" className="h-4 w-4" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}
