"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import CameraCapture from "@/components/CameraCapture";
import Icon from "@/components/Icon";
import { MAX_ORIGINAL_SIZE, prepareImage, readAsDataUrl } from "@/lib/image";

const AI_ERROR = "Unable to analyze the image right now. Please try again.";

const MODES = [
  { value: "upload", label: "Upload Image", icon: "image" },
  { value: "camera", label: "Use Camera", icon: "camera" },
];

/*
  AI image search popup with two options:
  - "upload": choose a photo from the gallery / computer
  - "camera": take a photo with the device camera
  Either way the photo is sent to our own API route (/api/image-search),
  which talks to Gemini on the server, so the API key never reaches the browser.
*/
export default function ImageSearchModal({ initialMode = "upload", onClose, onResult }) {
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState(initialMode);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const busy = preparing || loading;

  // Close with the Escape key (but not while working).
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [busy, onClose]);

  // Used for both gallery uploads and camera photos.
  async function handleFile(selected) {
    if (!selected) return;
    if (selected.size > MAX_ORIGINAL_SIZE) {
      setError("Image is too large. Please choose a smaller photo.");
      return;
    }

    setError("");
    setPreparing(true);
    try {
      const prepared = await prepareImage(selected); // resized JPEG, well under 4 MB
      setFile(prepared);
      setPreview(await readAsDataUrl(prepared));
    } catch {
      setError("Please choose an image file (JPG, PNG or WEBP).");
    } finally {
      setPreparing(false);
    }
  }

  function handleInputChange(event) {
    const selected = event.target.files?.[0];
    event.target.value = ""; // lets the user pick the same file again later
    handleFile(selected);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  function clearImage() {
    setFile(null);
    setPreview("");
    setError("");
  }

  function switchMode(nextMode) {
    if (busy || nextMode === mode) return;
    clearImage();
    setMode(nextMode);
  }

  async function handleSearch() {
    if (!file || busy) return;
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/image-search", { method: "POST", body: formData });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        setError(data?.error || AI_ERROR);
        setLoading(false);
        return;
      }
      onResult({ ...data, preview });
    } catch {
      setError(AI_ERROR);
      setLoading(false);
    }
  }

  let body;
  if (preparing) {
    body = (
      <div className="flex aspect-4/3 items-center justify-center gap-3 rounded-2xl bg-gray-50 text-sm text-gray-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
        Preparing image...
      </div>
    );
  } else if (preview) {
    body = (
      <div className="animate-scale-in overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
        <Image
          src={preview}
          alt="Selected image"
          width={400}
          height={300}
          unoptimized
          className="mx-auto max-h-64 w-auto object-contain"
        />
      </div>
    );
  } else if (mode === "camera") {
    body = <CameraCapture onCapture={handleFile} onUseUpload={() => switchMode("upload")} />;
  } else {
    body = (
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-12 transition ${
          dragging
            ? "border-indigo-500 bg-indigo-50 text-indigo-600"
            : "border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-600"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon name="upload" className="h-6 w-6" />
        </span>
        <span className="text-sm font-semibold">Select Image</span>
        <span className="text-xs text-gray-400">or drag and drop · JPG, PNG or WEBP</span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-gray-900/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-search-title"
        className="max-h-[92vh] w-full max-w-md animate-slide-up overflow-y-auto rounded-t-3xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:animate-scale-in sm:rounded-3xl sm:pb-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30">
            <Icon name="sparkles" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="image-search-title" className="text-lg font-bold text-gray-900">
              {mode === "camera" ? "Camera Search" : "Image Search"}
            </h2>
            <p className="text-xs text-gray-500">Powered by Google Gemini AI</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          {mode === "camera"
            ? "Take a photo of a product. AI will recognise it and find it in the Shopio store."
            : "Upload a photo of a product. AI will recognise it and find it in the Shopio store."}
        </p>

        {/* Switch between the two options */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
          {MODES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => switchMode(option.value)}
              disabled={busy}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === option.value ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon name={option.icon} className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="mt-5">{body}</div>

        {preview && !busy && (
          <div className="mt-3 flex gap-2">
            {mode === "camera" ? (
              <button type="button" onClick={clearImage} className="btn-secondary flex-1">
                Retake Photo
              </button>
            ) : (
              <>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary flex-1">
                  Change Image
                </button>
                <button type="button" onClick={clearImage} className="btn-danger flex-1">
                  Remove Image
                </button>
              </>
            )}
          </div>
        )}

        {loading && (
          <div className="alert-info mt-4 flex items-center gap-3">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-700" />
            Analyzing image with AI...
          </div>
        )}

        {error && <p className="alert-error mt-4">{error}</p>}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={busy} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSearch} disabled={!file || busy} className="btn-primary">
            <Icon name="sparkles" className="h-4 w-4" />
            {loading ? "Analyzing..." : "Search with AI"}
          </button>
        </div>
      </div>
    </div>
  );
}
