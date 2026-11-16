"use client";

import Image from "next/image";
import { Suspense, use, useCallback, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import ImageSearchModal from "@/components/ImageSearchModal";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { ProductGridSkeleton } from "@/components/Skeletons";
import { CATEGORIES, CATEGORY_ICONS, capitalize } from "@/lib/shop";
import { searchProducts } from "@/lib/search";

const POPULAR_SEARCHES = ["iphone", "laptop", "sneakers", "watch", "cricket bat"];

// Products shown at first; "Show more" adds this many each time.
const PAGE_SIZE = 16;

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
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
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
function Catalog({ productsPromise, query, category, sort, limit, aiResult, onCategoryChange, onSortChange, onClearAi, onReset, onShowMore }) {
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
      {/* Shop by Category: 3 x 2 tiles on phones (all visible at once), one row of 6 on desktop */}
      <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">Shop by Category</h2>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {["All", ...CATEGORIES].map((cat) => {
          const active = category === cat && !aiResult;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              aria-pressed={active}
              className={`group flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition sm:py-4 ${
                active
                  ? "border-indigo-500 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500"
                  : "border-gray-200 bg-white hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition sm:h-11 sm:w-11 ${
                  active
                    ? "bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
                    : "bg-gray-100 text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                }`}
              >
                <Icon name={CATEGORY_ICONS[cat]} className="h-5 w-5" />
              </span>
              <span className={`text-xs font-semibold sm:text-sm ${active ? "text-indigo-700" : "text-gray-900"}`}>
                {cat === "All" ? "All Products" : cat}
              </span>
              <span className="text-[11px] text-gray-500">{counts[cat] || 0} items</span>
            </button>
          );
        })}
      </div>

      {!aiResult && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{visibleProducts.length}</span>{" "}
            {visibleProducts.length === 1 ? "product" : "products"}
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
            className="input w-auto shrink-0 py-2 pr-8 pl-3"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

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
          <>
            <ProductGrid products={visibleProducts.slice(0, limit)} />
            {visibleProducts.length > limit && (
              <div className="mt-10 flex flex-col items-center gap-2">
                <p className="text-sm text-gray-500">
                  Showing {limit} of {visibleProducts.length} products
                </p>
                <button type="button" onClick={onShowMore} className="btn-secondary px-6">
                  Show more products
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function ProductBrowser({ productsPromise }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recommended");
  const [limit, setLimit] = useState(PAGE_SIZE);
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
  // Changing the search, category or sort starts again from the first page.
  function handleQueryChange(value) {
    setQuery(value);
    setAiResult(null);
    setLimit(PAGE_SIZE);
  }

  function handleCategoryChange(value) {
    setCategory(value);
    setAiResult(null);
    setLimit(PAGE_SIZE);
  }

  function handleSortChange(value) {
    setSort(value);
    setLimit(PAGE_SIZE);
  }

  function resetFilters() {
    setQuery("");
    setCategory("All");
    setAiResult(null);
    setLimit(PAGE_SIZE);
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

        <div className="relative mx-auto max-w-3xl px-4 py-10 text-center sm:py-20">
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
      <section id="products" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-8 sm:py-12">
        <Suspense
          fallback={
            <>
              <div className="skeleton mb-3 h-6 w-44" />
              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="skeleton h-24 rounded-2xl sm:h-28" />
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
            limit={limit}
            aiResult={aiResult}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onClearAi={() => setAiResult(null)}
            onReset={resetFilters}
            onShowMore={() => setLimit((current) => current + PAGE_SIZE)}
          />
        </Suspense>
      </section>

      {imageSearchMode && (
        <ImageSearchModal initialMode={imageSearchMode} onClose={closeImageSearch} onResult={handleAiResult} />
      )}
    </>
  );
}
