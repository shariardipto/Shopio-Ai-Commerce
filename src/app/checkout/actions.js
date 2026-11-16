"use server";

import { getCurrentUser } from "@/lib/auth";
import { PAYMENT_METHOD_LABELS, isUuid, normalizeBdPhone } from "@/lib/shop";

const NEEDS_LAST4 = ["bkash", "nagad", "rocket", "card"];
const NEEDS_REFERENCE = ["bkash", "nagad", "rocket", "bank"];

function clean(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

/*
  Places an order. Runs on the server.
  The browser only sends delivery details, the payment method and SAFE payment
  details (last 4 digits of the card / wallet number, TrxID or bank reference),
  plus the product IDs + quantities.
  Prices are NOT taken from the browser: the database function place_order()
  reads the real prices and calculates the totals.
*/
export async function placeOrder(order) {
  const { supabase, user } = await getCurrentUser();
  if (!user) {
    return { error: "Please log in to place your order." };
  }

  const fullName = clean(order?.fullName, 100);
  const email = clean(order?.email, 254);
  const phone = normalizeBdPhone(order?.phone);
  const address = clean(order?.address, 500);
  const paymentMethod = order?.paymentMethod;

  if (!fullName || !email || !address) {
    return { error: "Please fill in all delivery details." };
  }
  if (!phone) {
    return { error: "Please enter a valid Bangladeshi mobile number (01XXXXXXXXX)." };
  }
  if (!Object.hasOwn(PAYMENT_METHOD_LABELS, paymentMethod)) {
    return { error: "Please choose a payment method." };
  }

  const accountLast4 = NEEDS_LAST4.includes(paymentMethod) ? clean(order?.accountLast4, 4) : null;
  const paymentReference = NEEDS_REFERENCE.includes(paymentMethod)
    ? clean(order?.paymentReference, 30).toUpperCase()
    : null;

  if (accountLast4 !== null && !/^\d{4}$/.test(accountLast4)) {
    return { error: "Invalid payment details." };
  }
  if (paymentReference !== null && !/^[A-Z0-9-]{6,30}$/.test(paymentReference)) {
    return { error: "Please enter a valid transaction ID." };
  }

  const rawItems = Array.isArray(order?.items) ? order.items : [];
  const items = rawItems.map((item) => ({
    product_id: String(item?.productId ?? ""),
    quantity: Number(item?.quantity),
  }));

  if (items.length === 0) {
    return { error: "Your cart is empty." };
  }
  const itemsAreValid = items.every(
    (item) =>
      isUuid(item.product_id) &&
      Number.isInteger(item.quantity) &&
      item.quantity >= 1 &&
      item.quantity <= 99
  );
  if (!itemsAreValid) {
    return { error: "Your cart contains an invalid item. Please refresh your cart." };
  }

  const { data: orderId, error } = await supabase.rpc("place_order", {
    p_full_name: fullName,
    p_email: email,
    p_phone: phone,
    p_address: address,
    p_payment_method: paymentMethod,
    p_account_last4: accountLast4,
    p_payment_reference: paymentReference,
    p_items: items,
  });

  if (error) {
    // Messages raised on purpose inside place_order (code P0001) are safe to show,
    // e.g. "Laptop is out of stock." Anything else gets a generic message.
    return {
      error: error.code === "P0001" ? error.message : "Could not place your order. Please try again.",
    };
  }

  return { orderId };
}
