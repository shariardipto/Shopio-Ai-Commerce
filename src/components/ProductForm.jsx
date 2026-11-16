"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import Icon from "@/components/Icon";
import { CATEGORIES, MAX_IMAGE_SIZE, PLACEHOLDER_IMAGE } from "@/lib/shop";

/*
  Used by both "Add Product" and "Edit Product".
  `action` is a Server Action (createProduct or updateProduct). It saves the
  product and redirects to /admin/products, or returns { error }.
*/
export default function ProductForm({ action, product }) {
  const fileInputRef = useRef(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(product?.image_url || "");

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview(product?.image_url || "");
      return;
    }
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE) {
      setError("Please choose an image file of 4 MB or less.");
      event.target.value = "";
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");

    startTransition(async () => {
      const result = await action(formData);
      // On success the action redirects, so we only get here when something went wrong.
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid items-start gap-6 lg:grid-cols-3">
      <div className="card flex flex-col gap-5 p-6 lg:col-span-2">
        <h2 className="font-bold text-gray-900">Product Details</h2>

        <div>
          <label htmlFor="name" className="label">Product Name *</label>
          <input id="name" name="name" required placeholder="e.g. Blue Ballpoint Pen" defaultValue={product?.name} className="input" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="category" className="label">Category *</label>
            <select id="category" name="category" required defaultValue={product?.category || ""} className="input">
              <option value="" disabled>Choose...</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="price" className="label">Price (৳) *</label>
            <input id="price" name="price" type="number" min="0" step="0.01" required placeholder="0" defaultValue={product?.price} className="input" />
          </div>
          <div>
            <label htmlFor="stock" className="label">Stock *</label>
            <input id="stock" name="stock" type="number" min="0" step="1" required defaultValue={product?.stock ?? 0} className="input" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea id="description" name="description" rows={4} placeholder="Short description shown on the product page" defaultValue={product?.description || ""} className="input" />
        </div>

        <div>
          <label htmlFor="keywords" className="label">Keywords</label>
          <input
            id="keywords"
            name="keywords"
            placeholder="pen, ballpoint, writing"
            defaultValue={product?.keywords?.join(", ") || ""}
            className="input"
          />
          <p className="mt-1.5 text-xs text-gray-500">Comma-separated. Used by text search and AI image search.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:sticky lg:top-24">
        <div className="card p-6">
          <h2 className="font-bold text-gray-900">Product Image</h2>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative mt-4 block w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-indigo-400"
          >
            <Image
              src={preview || PLACEHOLDER_IMAGE}
              alt="Product image preview"
              width={400}
              height={400}
              unoptimized
              className="aspect-square w-full object-cover"
            />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900/50 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
              <Icon name="upload" className="h-6 w-6" />
              {preview ? "Change image" : "Upload image"}
            </span>
          </button>
          <input
            ref={fileInputRef}
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="sr-only"
          />
          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG or WEBP, max 4 MB.{product ? " Leave unchanged to keep the current image." : ""}
          </p>
        </div>

        <div className="card flex flex-col gap-3 p-6">
          {error && <p className="alert-error animate-fade-up">{error}</p>}
          <button type="submit" disabled={isPending} className="btn-primary w-full py-3">
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />
                {product ? "Save Changes" : "Add Product"}
              </>
            )}
          </button>
          <Link href="/admin/products" className="btn-secondary w-full">
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
