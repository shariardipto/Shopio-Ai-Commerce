// Grey placeholder shapes shown while data is loading.

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-5 w-20" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="skeleton h-9 rounded-xl" />
          <div className="skeleton h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton mt-3 h-4 w-72" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-28 rounded-2xl" />
      </div>
      <div className="skeleton mt-6 h-64 rounded-2xl" />
    </div>
  );
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-8 w-40" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="card space-y-4 p-5">
            <div className="flex justify-between">
              <div className="skeleton h-5 w-32" />
              <div className="skeleton h-5 w-20" />
            </div>
            <div className="skeleton h-2 w-full rounded-full" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
