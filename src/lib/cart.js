// Shopping cart stored in the browser's localStorage (not in the database).
import { useSyncExternalStore } from "react";

const CART_KEY = "shopio_cart";
const CART_EVENT = "shopio-cart-updated";
export const CART_ADDED_EVENT = "shopio-cart-added"; // shows the "Added to cart" toast
const EMPTY_CART = [];
const MAX_QUANTITY = 99;

// React needs the same array back until the cart really changes,
// so we remember the last value we read from localStorage.
let lastRaw = null;
let lastItems = EMPTY_CART;

export function getCart() {
  if (typeof window === "undefined") return EMPTY_CART;

  let raw = null;
  try {
    raw = window.localStorage.getItem(CART_KEY);
  } catch {
    return EMPTY_CART; // storage blocked (e.g. strict private mode)
  }

  if (raw !== lastRaw) {
    lastRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      lastItems = Array.isArray(parsed) ? parsed : EMPTY_CART;
    } catch {
      lastItems = EMPTY_CART;
    }
  }
  return lastItems;
}

function saveCart(items) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: nothing else we can do.
  }
  window.dispatchEvent(new Event(CART_EVENT));
}

// Adding the same product again increases its quantity.
export function addToCart(product, quantity = 1) {
  const items = getCart();
  const exists = items.some((item) => item.id === product.id);

  const nextItems = exists
    ? items.map((item) =>
        item.id === product.id
          ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + quantity) }
          : item
      )
    : [
        ...items,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image_url: product.image_url,
          quantity,
        },
      ];

  saveCart(nextItems);
  window.dispatchEvent(
    new CustomEvent(CART_ADDED_EVENT, {
      detail: { name: product.name, image_url: product.image_url, quantity },
    })
  );
}

// Quantity never goes below 1 (use Remove to delete an item).
export function updateQuantity(productId, quantity) {
  const safeQuantity = Math.min(MAX_QUANTITY, Math.max(1, quantity));
  saveCart(
    getCart().map((item) => (item.id === productId ? { ...item, quantity: safeQuantity } : item))
  );
}

export function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.id !== productId));
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount(items) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(items) {
  return items.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
}

// Notifies listeners when the cart changes in this tab or in another tab.
function subscribeToCart(callback) {
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

const subscribeToNothing = () => () => {};

/*
  React hook used by components:
  - items: the cart items (always up to date)
  - ready: false during server rendering, true once the browser cart has been read
*/
export function useCart() {
  const items = useSyncExternalStore(subscribeToCart, getCart, () => EMPTY_CART);
  const ready = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  return { items, ready };
}
