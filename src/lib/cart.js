const CART_KEY = "shopio_cart";
const CART_EVENT = "shopio-cart-updated";

function readCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCart() {
  return readCart();
}

export function addToCart(product, quantity = 1) {
  const items = readCart();
  const existing = items.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity,
    });
  }

  writeCart(items);
  return items;
}

export function updateQuantity(productId, quantity) {
  const items = readCart().map((item) =>
    item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
  );
  writeCart(items);
  return items;
}

export function removeFromCart(productId) {
  const items = readCart().filter((item) => item.id !== productId);
  writeCart(items);
  return items;
}

export function getCartCount() {
  return readCart().reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal() {
  return readCart().reduce((total, item) => total + item.price * item.quantity, 0);
}

// Notifies listeners (e.g. Navbar cart badge) in this tab and across tabs.
export function subscribeToCart(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
