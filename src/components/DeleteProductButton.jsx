"use client";

import { useTransition } from "react";
import { deleteProduct } from "@/app/admin/actions";
import Icon from "@/components/Icon";

export default function DeleteProductButton({ productId, productName }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result?.error) window.alert(result.error);
    });
  }

  return (
    <button type="button" onClick={handleDelete} disabled={isPending} className="btn-danger px-3 py-1.5">
      <Icon name="trash" className="h-4 w-4" />
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
