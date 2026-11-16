import Link from "next/link";
import Icon from "@/components/Icon";

/*
  Row of filter links used on admin pages (category, order status, user role).
  Phones: one row you can swipe sideways (a fade on the right shows there is more).
  Desktop: the chips simply wrap onto the next line.
  items: [{ href, label, count?, icon?, active }]
*/
export default function FilterChips({ items, label, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <nav
        aria-label={label}
        className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            scroll={false}
            aria-current={item.active ? "page" : undefined}
            className={`chip ${item.active ? "chip-active" : ""}`}
          >
            {item.icon && <Icon name={item.icon} className="h-4 w-4" />}
            {item.label}
            {item.count !== undefined && (
              <span
                className={`rounded-full px-1.5 text-xs ${item.active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
              >
                {item.count}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -right-4 w-10 bg-linear-to-l from-gray-50 to-transparent lg:hidden"
      />
    </div>
  );
}
