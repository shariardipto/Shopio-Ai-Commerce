import Link from "next/link";
import { updateUserRole } from "@/app/admin/actions";
import AccessDenied from "@/components/AccessDenied";
import Icon from "@/components/Icon";
import InlineSelect from "@/components/InlineSelect";
import StatusBadge from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { capitalize, formatDate, formatPrice } from "@/lib/shop";

export const metadata = { title: "Users" };

const ROLE_OPTIONS = [
  { value: "customer", label: "Customer" },
  { value: "admin", label: "Admin" },
];

const ROLE_INFO = [
  {
    role: "customer",
    icon: "user",
    points: ["Browse, search and AI image search", "Cart and checkout", "See only their own orders"],
  },
  {
    role: "admin",
    icon: "shield",
    points: [
      "Everything a customer can do",
      "Manage products, orders and payments",
      "Manage users and change roles",
    ],
  },
];

export default async function AdminUsersPage({ searchParams }) {
  const { supabase, user: me, isAdmin } = await requireUser("/admin/users");
  if (!isAdmin) return <AccessDenied />;

  const params = await searchParams;
  const roleFilter = ["customer", "admin"].includes(params.role) ? params.role : "all";
  const query = String(params.q || "").trim().toLowerCase();

  // Admins can read every profile (RLS policy uses is_admin()). orders(...) loads each user's orders.
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at, orders(total, order_status)")
    .order("created_at", { ascending: false });

  const allUsers = (data || []).map((profile) => {
    const validOrders = profile.orders.filter((order) => order.order_status !== "cancelled");
    return {
      ...profile,
      orderCount: profile.orders.length,
      totalSpent: validOrders.reduce((sum, order) => sum + Number(order.total), 0),
    };
  });

  const counts = {
    all: allUsers.length,
    customer: allUsers.filter((u) => u.role === "customer").length,
    admin: allUsers.filter((u) => u.role === "admin").length,
  };

  const users = allUsers.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (!query) return true;
    return `${u.full_name || ""} ${u.email || ""}`.toLowerCase().includes(query);
  });

  function tabHref(role) {
    const search = new URLSearchParams();
    if (role !== "all") search.set("role", role);
    if (query) search.set("q", query);
    const text = search.toString();
    return text ? `/admin/users?${text}` : "/admin/users";
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Users</h1>
      <p className="mt-1 text-gray-600">Everyone who has an account, and what they are allowed to do.</p>

      {/* Roles explained */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {ROLE_INFO.map((info) => (
          <div key={info.role} className="card flex gap-4 p-5">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                info.role === "admin" ? "bg-violet-50 text-violet-600" : "bg-gray-100 text-gray-600"
              }`}
            >
              <Icon name={info.icon} className="h-5 w-5" />
            </span>
            <div>
              <p className="flex items-center gap-2 font-semibold text-gray-900">
                {capitalize(info.role)} <span className="text-sm font-normal text-gray-400">({counts[info.role]})</span>
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-gray-600">
                {info.points.map((point) => (
                  <li key={point} className="flex items-center gap-1.5">
                    <Icon name="check" className="h-3.5 w-3.5 text-green-600" strokeWidth={2.5} /> {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
        <Icon name="lock" className="h-3.5 w-3.5" />
        New sign-ups are always customers. Admins cannot change their own role, so the store always keeps an admin.
      </p>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "customer", "admin"].map((role) => (
            <Link
              key={role}
              href={tabHref(role)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                roleFilter === role
                  ? "bg-gray-900 text-white shadow-md"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {role === "all" ? "All Users" : `${capitalize(role)}s`}
              <span className={`rounded-full px-1.5 text-xs ${roleFilter === role ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                {counts[role]}
              </span>
            </Link>
          ))}
        </div>

        {/* Plain GET form: works without JavaScript */}
        <form action="/admin/users" className="flex w-full gap-2 lg:w-auto">
          {roleFilter !== "all" && <input type="hidden" name="role" value={roleFilter} />}
          <div className="relative flex-1 lg:flex-none">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search name or email"
              aria-label="Search users"
              className="input w-full py-2 pl-9 lg:w-64"
            />
          </div>
          <button type="submit" className="btn-secondary py-2">Search</button>
        </form>
      </div>

      {error && <p className="alert-error mt-6">Could not load users.</p>}

      {users.length === 0 ? (
        <div className="card mt-6 py-16 text-center">
          <Icon name="user" className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-215 text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50/80 text-xs tracking-wide text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Orders</th>
                <th className="px-5 py-3.5 font-semibold">Total Spent</th>
                <th className="px-5 py-3.5 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 align-middle">
              {users.map((u) => {
                const isMe = u.id === me.id;
                const name = u.full_name || u.email;
                return (
                  <tr key={u.id} className="transition hover:bg-indigo-50/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white uppercase ${
                            u.role === "admin" ? "bg-linear-to-br from-violet-500 to-indigo-600" : "bg-gray-400"
                          }`}
                        >
                          {name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 font-semibold text-gray-900">
                            {name}
                            {isMe && (
                              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">YOU</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {isMe ? (
                        <StatusBadge status={u.role} />
                      ) : (
                        <InlineSelect
                          action={updateUserRole.bind(null, u.id)}
                          value={u.role}
                          options={ROLE_OPTIONS}
                          label={`Role of ${name}`}
                          confirmValue="admin"
                          confirmMessage={`Make ${name} an admin? They will be able to manage products, orders, payments and users.`}
                        />
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {u.orderCount > 0 ? (
                        <Link href={`/admin/orders?user=${u.id}`} className="font-medium text-indigo-600 hover:underline">
                          {u.orderCount} {u.orderCount === 1 ? "order" : "orders"}
                        </Link>
                      ) : (
                        <span className="text-gray-400">No orders</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{formatPrice(u.totalSpent)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">{formatDate(u.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
