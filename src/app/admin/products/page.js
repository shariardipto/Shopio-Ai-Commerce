import Image from "next/image";
import Link from "next/link";
import AccessDenied from "@/components/AccessDenied";
import DeleteProductButton from "@/components/DeleteProductButton";
import FilterChips from "@/components/FilterChips";
import Icon from "@/components/Icon";
import { requireUser } from "@/lib/auth";
import { CATEGORIES, CATEGORY_ICONS, PLACEHOLDER_IMAGE, formatPrice } from "@/lib/shop";

export const metadata = { title: "Manage Products" };

const MESSAGES = {
  created: "Product added successfully.",
  updated: "Product updated successfully.",
};

function StockLabel({ stock }) {
  if (stock <= 0) {
    return <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">Out of stock</span>;
  }
  return <span className={`font-medium ${stock <= 10 ? "text-amber-600" : "text-gray-900"}`}>{stock}</span>;
}

export default async function AdminProductsPage({ searchParams }) {
  const { supabase, isAdmin } = await requireUser("/admin/products");
  if (!isAdmin) return <AccessDenied />;

  // Optional filter: /admin/products?category=Electronics
  const { status, category } = await searchParams;
  const activeCategory = CATEGORIES.includes(category) ? category : "All";

  const { data, error } = await supabase
    .from("products")
    .select("id, name, category, price, stock, image_url")
    .order("created_at", { ascending: false });

  const allProducts = data || [];
  const products =
    activeCategory === "All" ? allProducts : allProducts.filter((product) => product.category === activeCategory);

  const categoryChips = ["All", ...CATEGORIES].map((cat) => ({
    href: cat === "All" ? "/admin/products" : `/admin/products?category=${encodeURIComponent(cat)}`,
    label: cat,
    icon: CATEGORY_ICONS[cat],
    count: cat === "All" ? allProducts.length : allProducts.filter((product) => product.category === cat).length,
    active: activeCategory === cat,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Products</h1>
          <p className="mt-1 text-gray-600">{allProducts.length} products in the store</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Icon name="plus" className="h-4 w-4" strokeWidth={2.5} /> Add Product
        </Link>
      </div>

      {MESSAGES[status] && (
        <p className="alert-success mt-6 flex animate-fade-up items-center gap-2">
          <Icon name="check" className="h-4 w-4" strokeWidth={2.5} /> {MESSAGES[status]}
        </p>
      )}
      {error && <p className="alert-error mt-6">Could not load products.</p>}

      {/* Category filter */}
      <FilterChips items={categoryChips} label="Filter by category" className="mt-6" />

      {products.length === 0 && !error && (
        <div className="card mt-6 py-16 text-center">
          <Icon name="package" className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">
            {activeCategory === "All" ? "No products yet. Add your first product." : `No products in ${activeCategory}.`}
          </p>
        </div>
      )}

      {products.length > 0 && (
        <>
          {/* Phones: one card per product */}
          <ul className="mt-4 space-y-3 md:hidden">
            {products.map((product) => (
              <li key={product.id} className="card flex gap-3 p-3">
                <Image
                  src={product.image_url || PLACEHOLDER_IMAGE}
                  alt={product.name}
                  width={72}
                  height={72}
                  className="h-18 w-18 shrink-0 rounded-xl bg-gray-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${product.id}`} className="line-clamp-1 font-semibold text-gray-900">
                    {product.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Icon name={CATEGORY_ICONS[product.category] || "package"} className="h-3.5 w-3.5" />
                      {product.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      Stock: <StockLabel stock={product.stock} />
                    </span>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="btn-secondary flex-1 px-3 py-1.5">
                      <Icon name="edit" className="h-4 w-4" /> Edit
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Tablet / desktop: table */}
          <div className="card mt-6 hidden overflow-x-auto md:block">
            <table className="w-full min-w-170 text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-xs tracking-wide text-gray-500 uppercase">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Product</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Price</th>
                  <th className="px-5 py-3.5 font-semibold">Stock</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="transition hover:bg-indigo-50/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.image_url || PLACEHOLDER_IMAGE}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 shrink-0 rounded-xl bg-gray-100 object-cover"
                        />
                        <Link href={`/product/${product.id}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        <Icon name={CATEGORY_ICONS[product.category] || "package"} className="h-3.5 w-3.5" />
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{formatPrice(product.price)}</td>
                    <td className="px-5 py-3">
                      <StockLabel stock={product.stock} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`} className="btn-secondary px-3 py-1.5">
                          <Icon name="edit" className="h-4 w-4" /> Edit
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
