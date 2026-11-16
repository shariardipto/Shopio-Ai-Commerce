import Image from "next/image";
import Link from "next/link";
import AccessDenied from "@/components/AccessDenied";
import DeleteProductButton from "@/components/DeleteProductButton";
import Icon from "@/components/Icon";
import { requireUser } from "@/lib/auth";
import { PLACEHOLDER_IMAGE, formatPrice } from "@/lib/shop";

export const metadata = { title: "Manage Products" };

const MESSAGES = {
  created: "Product added successfully.",
  updated: "Product updated successfully.",
};

export default async function AdminProductsPage({ searchParams }) {
  const { supabase, isAdmin } = await requireUser("/admin/products");
  if (!isAdmin) return <AccessDenied />;

  const { status } = await searchParams;
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, category, price, stock, image_url")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Products</h1>
          <p className="mt-1 text-gray-600">{products?.length ?? 0} products in the store</p>
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

      {products?.length === 0 && (
        <div className="card mt-6 py-16 text-center">
          <Icon name="package" className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-gray-500">No products yet. Add your first product.</p>
        </div>
      )}

      {products?.length > 0 && (
        <div className="card mt-6 overflow-x-auto">
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
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3">
                    {product.stock > 0 ? (
                      <span className={`font-medium ${product.stock <= 10 ? "text-amber-600" : "text-gray-900"}`}>
                        {product.stock}
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                        Out of stock
                      </span>
                    )}
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
      )}
    </div>
  );
}
