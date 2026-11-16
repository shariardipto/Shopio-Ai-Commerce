"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

const IMAGE_OPTIONS = [
  { key: "upload", icon: "image", title: "Upload Image", text: "Choose from gallery or files" },
  { key: "camera", icon: "camera", title: "Take Photo", text: "Use your camera right now" },
];

// Text search + ONE "Image Search" button with two options: upload a photo or take one.
export default function SearchBar({ value, onChange, onSubmit, onImageSearch, onCameraSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the menu when clicking outside it or pressing Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    }
    function handleKey(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit?.();
  }

  function choose(option) {
    setMenuOpen(false);
    if (option === "camera") onCameraSearch();
    else onImageSearch();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-indigo-500/5 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100"
    >
      <Icon name="search" className="ml-2.5 h-5 w-5 shrink-0 text-gray-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products, e.g. pen, mouse..."
        aria-label="Search products"
        className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
      )}

      <span className="mx-1 h-7 w-px bg-gray-200" aria-hidden="true" />

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Image search"
          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
            menuOpen ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
          }`}
        >
          <Icon name="camera" className="h-5 w-5" />
          <span className="hidden sm:inline">Image Search</span>
          <svg
            className={`hidden h-4 w-4 transition sm:block ${menuOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute top-full right-0 z-30 mt-3 w-64 origin-top-right animate-scale-in rounded-2xl border border-gray-200 bg-white p-1.5 text-left shadow-2xl shadow-gray-900/10"
          >
            {IMAGE_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                role="menuitem"
                onClick={() => choose(option.key)}
                className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-indigo-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Icon name={option.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-gray-900">{option.title}</span>
                  <span className="block text-xs text-gray-500">{option.text}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
