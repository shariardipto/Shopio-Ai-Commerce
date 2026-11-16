import Link from "next/link";
import AccessDenied from "@/components/AccessDenied";
import ProductForm from "@/components/ProductForm";
import { updateProduct } from "@/app/admin/actions";
import Icon from "@/components/Icon";
import { requireUser } from "@/lib/auth";
import { isUuid } from "@/lib/shop";

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const { supabase, isAdmin } = await requireUser(`/admin/products/${id}/edit`);
  if (!isAdmin) return <AccessDenied />;

  let product = null;
  if (isUuid(id)) {
    const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    product = data;
  }

  if (!product) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link href="/admin/products" className="btn-primary mt-6">
          Back to products
        </Link>
      </div>
    );
  }

  // bind() sends the product ID to the Server Action together with the form data.
  const updateThisProduct = updateProduct.bind(null, product.id);

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600">
        <Icon name="arrowLeft" className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">Edit Product</h1>
      <ProductForm action={updateThisProduct} product={product} />
    </div>
  );
}
