import Link from "next/link";
import AccessDenied from "@/components/AccessDenied";
import Icon from "@/components/Icon";
import ProductForm from "@/components/ProductForm";
import { createProduct } from "@/app/admin/actions";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const { isAdmin } = await requireUser("/admin/products/new");
  if (!isAdmin) return <AccessDenied />;

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600">
        <Icon name="arrowLeft" className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">Add Product</h1>
      <ProductForm action={createProduct} />
    </div>
  );
}
