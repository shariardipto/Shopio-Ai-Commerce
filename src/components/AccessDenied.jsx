import Link from "next/link";
import Icon from "@/components/Icon";

// Shown when a logged-in customer (not an admin) opens an /admin page.
export default function AccessDenied() {
  return (
    <div className="mx-auto max-w-md animate-fade-up py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <Icon name="lock" className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-gray-900">Access Denied</h1>
      <p className="mt-2 text-gray-600">You need an admin account to view this page.</p>
      <Link href="/" className="btn-primary mt-6">
        <Icon name="store" className="h-4 w-4" /> Go to Store
      </Link>
    </div>
  );
}
