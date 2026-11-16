// Skeleton shown while a product page loads.
export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10" aria-busy="true" aria-label="Loading product">
      <div className="skeleton h-4 w-56" />
      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-14">
        <div className="skeleton aspect-square rounded-3xl" />
        <div className="space-y-4">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-10 w-3/4" />
          <div className="skeleton h-9 w-32" />
          <div className="skeleton h-6 w-40 rounded-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
