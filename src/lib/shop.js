// Shared constants and small helpers used across Shopio.

export const CATEGORIES = ["Stationery", "Electronics", "Fashion", "Accessories"];

// Fixed delivery charge in BDT (the database function place_order uses the same value).
export const SHIPPING_FEE = 80;

export const ORDER_STATUSES = ["pending", "processing", "completed", "cancelled"];

export const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB

export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

// ---------- Payments (Bangladesh) ----------
// Stored in orders.payment_method. All online payments are DEMO only.
export const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  card: "Card",
  bank: "Bank Transfer",
};

// Mobile banking wallets. The merchant numbers are fake demo numbers.
export const MOBILE_WALLETS = [
  { value: "bkash", label: "bKash", color: "#E2136E", ussd: "*247#", merchant: "01700-000001" },
  { value: "nagad", label: "Nagad", color: "#F15A22", ussd: "*167#", merchant: "01700-000002" },
  { value: "rocket", label: "Rocket", color: "#8C3494", ussd: "*322#", merchant: "01700-000003" },
];

// Demo bank account shown for "Bank Transfer".
export const DEMO_BANK_ACCOUNT = {
  bank: "Demo Bank PLC",
  name: "Shopio Ltd.",
  number: "1234-5678-9012",
  branch: "Gulshan, Dhaka",
};

// ---------- Delivery (Bangladesh) ----------
export const BD_DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

/*
  Bangladeshi mobile numbers: returns "01XXXXXXXXX" or null if invalid.
  Accepts "01712345678", "+8801712345678", "8801712345678" and "017-1234-5678".
*/
export function normalizeBdPhone(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(2); // 8801XXXXXXXXX -> 01XXXXXXXXX
  return /^01[3-9]\d{8}$/.test(digits) ? digits : null;
}

// Bangladeshi number format with lakh/crore grouping: 120000 -> "৳1,20,000".
// A fixed locale keeps server and browser output identical (avoids hydration errors).
export function formatPrice(amount) {
  return `৳${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

// "3f2b9c1e-...." -> "#3F2B9C1E"
export function shortOrderId(id) {
  return `#${String(id).slice(0, 8).toUpperCase()}`;
}

export function formatDate(value) {
  return new Date(value).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Product and order IDs are UUIDs. Checking first avoids pointless database queries.
export function isUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export function capitalize(text) {
  const value = String(text || "");
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Only allow redirects to pages inside Shopio (e.g. "/checkout"), never to other websites.
export function safeRedirectPath(path) {
  if (typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\")) {
    return path;
  }
  return "/";
}
