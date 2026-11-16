// Browser-only image helpers for the AI image search.

const MAX_DIMENSION = 1600; // pixels: more than enough for product recognition

// Files bigger than this are refused before we even try to open them.
export const MAX_ORIGINAL_SIZE = 20 * 1024 * 1024; // 20 MB

/*
  Shrinks a photo (max 1600 px) and converts it to JPEG.
  Phone photos are often 5–10 MB, so this keeps every upload well under the
  server's 4 MB limit and makes the AI request faster.
  Rejects if the file is not an image the browser can open.
*/
export function prepareImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);

      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff"; // transparent PNG areas become white
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(new File([blob], "search-image.jpg", { type: "image/jpeg" }));
          else reject(new Error("Could not convert image"));
        },
        "image/jpeg",
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Not a readable image"));
    };

    img.src = url;
  });
}

// File -> "data:image/jpeg;base64,..." (used for the preview thumbnail).
export function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
