// Skeleton shown while an admin page loads (inside the admin layout).
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton mt-3 h-4 w-64" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-28 rounded-2xl" />
        <div className="skeleton h-28 rounded-2xl" />
      </div>
      <div className="skeleton mt-6 h-72 rounded-2xl" />
    </div>
  );
}
