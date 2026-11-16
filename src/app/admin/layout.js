import AdminNav from "@/components/AdminNav";
import { getCurrentUser } from "@/lib/auth";

/*
  Shared wrapper for all /admin pages. It only decides whether to show the
  admin menu. The real permission check is done in every admin page and
  every admin action (layouts are not re-run on every navigation).
*/
export default async function AdminLayout({ children }) {
  const { isAdmin } = await getCurrentUser();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {isAdmin && <AdminNav />}
      {children}
    </div>
  );
}
