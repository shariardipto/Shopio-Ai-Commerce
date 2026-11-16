"use client";

import Image from "next/image";
import { Suspense, use, useCallback, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import ImageSearchModal from "@/components/ImageSearchModal";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { CATEGORIES, capitalize } from "@/lib/shop";
import { searchProducts } from "@/lib/search";

const POPULAR_SEARCHES = ["pen", "mouse", "notebook", "backpack", "shoes"];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

function sortProducts(products, sort) {
  if (sort === "recommended") return products; // newest first, or best text matches first
  const sorted = [...products];
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
}

function scrollToProducts() {
  document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        // Cards fade in one after another. The first row loads its images immediately.
        <div
          key={product.id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
        >
          <ProductCard product={product} eager={index < 4} />
        </div>
      ))}
    </div>
  );
}

// Shows what Gemini detected and the matching (or related) products from our database.
function AiResults({ result, onClear }) {
  const detected = capitalize(result.detected.object);
  const terms = result.detected.searchTerms.slice(0, 4);

  return (
    <div className="animate-fade-up">
      <div className="card relative overflow-hidden p-4 sm:p-5">
        <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-indigo-500 to-violet-500" />
        <div className="flex items-center gap-4">
          {result.preview && (
            <Image
              src={result.preview}
              alt="Your photo"
              width={72}
              height={72}
              unoptimized
              className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-gray-200 sm:h-18 sm:w-18"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-indigo-600">
              <Icon name="sparkles" className="h-4 w-4" /> AI detected:
            </p>
            <p className="truncate text-xl font-bold text-gray-900">{detected}</p>
            {terms.length > 0 && (
              <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
                {terms.map((term) => (
                  <span key={term} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                    {term}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={onClear} className="btn-secondary px-3">
            <Icon name="x" className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {result.matchType === "exact" && (
        <>
          <h2 className="mt-8 mb-5 text-xl font-bold text-gray-900">
            Matching Products <span className="font-normal text-gray-400">({result.products.length})</span>
          </h2>
          <ProductGrid products={result.products} />
        </>
      )}

      {result.matchType === "related" && (
        <>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">No {detected} Product Found</p>
              <p className="text-sm text-amber-800">
                We don&apos;t sell this exact item yet, but these related products are available.
              </p>
            </div>
          </div>
          <h2 className="mt-8 mb-5 text-xl font-bold text-gray-900">Related Products</h2>
          <ProductGrid products={result.products} />
        </>
      )}

      {result.matchType === "none" && (
        <div className="py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            <Icon name="package" className="h-7 w-7" />
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-900">No {detected} Product Found</p>
          <p className="mt-1 text-gray-500">No matching or related products are currently available.</p>
        </div>
      )}
    </div>
  );
}

// Reads the streamed products (React `use`) and shows filters + the product grid.
function Catalog({ productsPromise, query, category, sort, aiResult, onCategoryChange, onSortChange, onClearAi, onReset }) {
  const { products, error } = use(productsPromise);

  const counts = useMemo(() => {
    const result = { All: products.length };
    for (const product of products) result[product.category] = (result[product.category] || 0) + 1;
    return result;
  }, [products]);

  // Normal text search runs in the browser on the products loaded from Supabase (no AI).
  const visibleProducts = useMemo(() => {
    const inCategory = category === "All" ? products : products.filter((p) => p.category === category);
    return sortProducts(searchProducts(inCategory, query), sort);
  }, [products, query, category, sort]);

  if (error) {
    return (
      <p className="alert-error text-center">Could not load products. Please check your Supabase configuration.</p>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((cat) => {
            const active = category === cat && !aiResult;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-gray-900 text-white shadow-md"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {cat}
                <span
                  className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  {counts[cat] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {!aiResult && (
          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <p className="text-sm text-gray-500">
              {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}
              {query.trim() && (
                <>
                  {" "}for <span className="font-medium text-gray-900">“{query.trim()}”</span>
                </>
              )}
            </p>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort products"
              className="input w-auto py-2 pr-8"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-8">
        {aiResult ? (
          <AiResults result={aiResult} onClear={onClearAi} />
        ) : visibleProducts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <Icon name="search" className="h-7 w-7" />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">No products found.</p>
            <p className="mt-1 text-sm text-gray-500">Try a different word, category, or search with a photo.</p>
            <button type="button" onClick={onReset} className="btn-secondary mt-5">
              Clear filters
            </button>
          </div>
        ) : (
          <ProductGrid products={visibleProducts} />
        )}
      </div>
    </>
  );
}

export default function ProductBrowser({ productsPromise }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recommended");
  // null = closed, "upload" = Image Search, "camera" = Camera Search
  const [imageSearchMode, setImageSearchMode] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const closeImageSearch = useCallback(() => setImageSearchMode(null), []);

  function handleAiResult(result) {
    setAiResult(result);
    setImageSearchMode(null);
    requestAnimationFrame(scrollToProducts);
  }

  // Typing or choosing a category returns to the normal product list.
  function handleQueryChange(value) {
    setQuery(value);
    setAiResult(null);
  }

  function handleCategoryChange(value) {
    setCategory(value);
    setAiResult(null);
  }

  function resetFilters() {
    setQuery("");
    setCategory("All");
    setAiResult(null);
  }

  return (
    <>
      {/* HERO */}
      <section id="search" className="relative z-10 scroll-mt-16 border-b border-gray-200/70 bg-linear-to-b from-indigo-50 via-white to-gray-50">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-20 h-72 w-72 animate-float rounded-full bg-indigo-300/30 blur-3xl" />
          <div className="absolute top-10 -right-16 h-72 w-72 animate-float rounded-full bg-fuchsia-300/25 blur-3xl [animation-delay:-4s]" />
          <div className="absolute inset-0 bg-[radial-gradient(#c7d2fe_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,white,transparent)] bg-size-[22px_22px] opacity-40" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:py-20">
          <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
            <Icon name="sparkles" className="h-4 w-4" />
            New: search with a photo or your camera
          </span>
          <h1 className="mt-6 animate-fade-up text-4xl font-extrabold tracking-tight text-gray-900 [animation-delay:80ms] sm:text-6xl">
            Find Easily What You&apos;re <span className="text-gradient">Looking For</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl animate-fade-up text-base text-gray-600 [animation-delay:160ms] sm:text-lg">
            Search and discover products easily with Shopio.
          </p>

          <div className="relative z-20 mt-8 animate-fade-up [animation-delay:240ms]">
            <SearchBar
              value={query}
              onChange={handleQueryChange}
              onSubmit={scrollToProducts}
              onImageSearch={() => setImageSearchMode("upload")}
              onCameraSearch={() => setImageSearchMode("camera")}
            />
          </div>

          <div className="mt-5 flex animate-fade-up flex-wrap items-center justify-center gap-2 text-sm [animation-delay:320ms]">
            <span className="text-gray-500">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  handleQueryChange(term);
                  scrollToProducts();
                }}
                className="rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-gray-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-10 sm:py-12">
        <Suspense
          fallback={
            <>
              <div className="flex flex-wrap gap-2">
                {[64, 104, 112, 92, 120].map((width) => (
                  <div key={width} className="skeleton h-9 rounded-full" style={{ width }} />
                ))}
              </div>
              <div className="mt-8">
                <ProductGridSkeleton />
              </div>
            </>
          }
        >
          <Catalog
            productsPromise={productsPromise}
            query={query}
            category={category}
            sort={sort}
            aiResult={aiResult}
            onCategoryChange={handleCategoryChange}
            onSortChange={setSort}
            onClearAi={() => setAiResult(null)}
            onReset={resetFilters}
          />
        </Suspense>
      </section>

      {imageSearchMode && (
        <ImageSearchModal initialMode={imageSearchMode} onClose={closeImageSearch} onResult={handleAiResult} />
      )}
    </>
  );
}
