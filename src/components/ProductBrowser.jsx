"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";

const CATEGORIES = ["All", "Stationery", "Electronics", "Fashion", "Accessories"];

// Case-insensitive, whitespace-tolerant match across name, category and keywords.
function normalize(text) {
  return (text || "").toLowerCase().trim().replace(/\s+/g, " ");
}

export default function ProductBrowser({ products }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalize(query);

    return products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      const haystack = normalize(
        [product.name, product.category, ...(product.keywords || [])].join(" ")
      );

      return normalizedQuery.split(" ").every((word) => haystack.includes(word));
    });
  }, [products, query, category]);

  return (
    <section id="search" className="mx-auto max-w-6xl px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <p className="mt-16 text-center text-gray-500">No products found.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
