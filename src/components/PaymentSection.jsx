"use client";

import Icon from "@/components/Icon";
import { MOBILE_WALLETS, formatBdPhone, formatPrice, normalizeBdPhone } from "@/lib/shop";

/*
  PAYMENT (Bangladesh) — 3 options:
  1. Cash on Delivery
  2. Mobile Banking: bKash / Nagad / Rocket (send money, then enter wallet number + TrxID)
  3. Card / Bank: debit/credit card, or bank transfer with a reference number
  All online payments are DEMO only. Only safe details are sent to the server:
  last 4 digits of the card/wallet number and the TrxID / bank reference.
  Card number, expiry, CVV, PIN and OTP never leave the browser.
  Which methods appear (and the merchant numbers / bank account) comes from
  the admin's payment settings (/admin/payments).
*/

// What the admin has turned on, ready for the UI.
export function getPaymentOptions(settings) {
  const wallets = MOBILE_WALLETS.filter((wallet) => settings[`${wallet.value}_enabled`]).map((wallet) => ({
    ...wallet,
    merchant: formatBdPhone(settings[`${wallet.value}_number`]),
  }));
  const onlineTypes = [settings.card_enabled && "card", settings.bank_enabled && "bank"].filter(Boolean);

  const options = [];
  if (settings.cod_enabled) {
    options.push({ value: "cod", title: "Cash on Delivery", hint: "Pay in cash when it arrives", icon: "cash" });
  }
  if (wallets.length > 0) {
    options.push({ value: "mobile", title: "Mobile Banking", hint: wallets.map((w) => w.label).join(" · "), icon: "phone" });
  }
  if (onlineTypes.length > 0) {
    const hint = [settings.card_enabled && "Visa · Mastercard", settings.bank_enabled && "Bank"].filter(Boolean).join(" · ");
    options.push({ value: "online", title: settings.card_enabled ? "Card / Bank" : "Bank Transfer", hint, icon: "card" });
  }
  return { options, wallets, onlineTypes };
}

// Starting state: the first payment option the admin has turned on.
export function createInitialPayment(settings) {
  const { options, wallets, onlineTypes } = getPaymentOptions(settings);
  return {
    option: options[0]?.value ?? null, // "cod" | "mobile" | "online"
    wallet: wallets[0]?.value ?? "bkash", // "bkash" | "nagad" | "rocket"
    onlineType: onlineTypes[0] ?? "card", // "card" | "bank"
    walletNumber: "",
    trxId: "",
    card: { name: "", number: "", expiry: "", cvv: "" },
    bankReference: "",
  };
}

// ---------- card helpers ----------
function cardBrand(digits) {
  if (/^4/.test(digits)) return "VISA";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return null;
}

function cardLength(digits) {
  return cardBrand(digits) === "Amex" ? 15 : 16;
}

// "4242424242424242" -> "4242 4242 4242 4242"
function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "");
  return digits.slice(0, cardLength(digits)).replace(/(\d{4})(?=\d)/g, "$1 ");
}

// "1228" -> "12/28"
function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

// Luhn checksum: the standard test that a card number is typed correctly.
function passesLuhn(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

// ---------- validation + what we send to the server ----------
export function validatePayment(payment) {
  if (!payment.option) return "No payment method is available right now.";

  if (payment.option === "mobile") {
    const wallet = MOBILE_WALLETS.find((w) => w.value === payment.wallet);
    if (!normalizeBdPhone(payment.walletNumber)) {
      return `Please enter your ${wallet.label} account number (01XXXXXXXXX).`;
    }
    if (!/^[A-Za-z0-9]{6,20}$/.test(payment.trxId.trim())) {
      return `Please enter the Transaction ID (TrxID) from your ${wallet.label} SMS.`;
    }
    return "";
  }

  if (payment.option === "online" && payment.onlineType === "bank") {
    if (!/^[A-Za-z0-9-]{6,30}$/.test(payment.bankReference.trim())) {
      return "Please enter the bank transaction / reference number (6–30 letters or numbers).";
    }
    return "";
  }

  if (payment.option === "online") {
    const { card } = payment;
    const digits = card.number.replace(/\s/g, "");
    if (!card.name.trim()) return "Please enter the cardholder name.";
    if (digits.length !== cardLength(digits) || !passesLuhn(digits)) return "Please enter a valid card number.";

    const match = card.expiry.match(/^(\d{2})\/(\d{2})$/);
    const month = match ? Number(match[1]) : 0;
    if (!match || month < 1 || month > 12) return "Expiry must be in MM/YY format.";
    const expiryEnd = new Date(2000 + Number(match[2]), month, 1); // first day after the expiry month
    if (expiryEnd <= new Date()) return "This card has expired.";

    const cvvLength = cardBrand(digits) === "Amex" ? 4 : 3;
    if (card.cvv.length !== cvvLength) return `CVV must be ${cvvLength} digits.`;
  }
  return "";
}

export function getPaymentDetails(payment) {
  if (payment.option === "mobile") {
    return {
      paymentMethod: payment.wallet,
      accountLast4: normalizeBdPhone(payment.walletNumber).slice(-4),
      paymentReference: payment.trxId.trim().toUpperCase(),
    };
  }
  if (payment.option === "online" && payment.onlineType === "bank") {
    return { paymentMethod: "bank", paymentReference: payment.bankReference.trim().toUpperCase() };
  }
  if (payment.option === "online") {
    return { paymentMethod: "card", accountLast4: payment.card.number.replace(/\s/g, "").slice(-4) };
  }
  return { paymentMethod: "cod" };
}

// ---------- small UI pieces ----------
export function SectionTitle({ number, children }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">
        {number}
      </span>
      {children}
    </h2>
  );
}

function DemoNote({ children }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
      <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

// Visual card that updates while the customer types.
function CardPreview({ card }) {
  const digits = card.number.replace(/\s/g, "");
  const brand = cardBrand(digits);
  const shown = digits.padEnd(cardLength(digits), "•").replace(/(.{4})(?=.)/g, "$1 ");

  return (
    <div className="relative aspect-[1.6] w-full max-w-xs overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-xl shadow-indigo-500/30">
      <div aria-hidden="true" className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
      <div aria-hidden="true" className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="h-7 w-10 rounded-md bg-linear-to-br from-amber-200 to-amber-400" />
          <span className="text-sm font-extrabold tracking-wide italic">{brand || "DEMO"}</span>
        </div>
        <p className="font-mono text-lg tracking-widest sm:text-xl">{shown}</p>
        <div className="flex items-end justify-between gap-4 text-xs">
          <div className="min-w-0">
            <p className="text-white/60">Card Holder</p>
            <p className="truncate font-semibold tracking-wide uppercase">{card.name || "Your Name"}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60">Expires</p>
            <p className="font-mono font-semibold">{card.expiry || "MM/YY"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SegmentedControl({ value, options, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            value === option.value ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Icon name={option.icon} className="h-4 w-4" />
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ---------- the payment section ----------
export default function PaymentSection({ payment, onChange, total, settings }) {
  const update = (changes) => onChange({ ...payment, ...changes });
  const updateCard = (changes) => update({ card: { ...payment.card, ...changes } });
  const { options, wallets, onlineTypes } = getPaymentOptions(settings);
  const wallet = wallets.find((w) => w.value === payment.wallet) || wallets[0];
  const digits = payment.card.number.replace(/\s/g, "");

  if (options.length === 0) {
    return (
      <section className="card p-6">
        <SectionTitle number="2">Payment Method</SectionTitle>
        <p className="alert-error mt-5">No payment method is available right now. Please try again later.</p>
      </section>
    );
  }

  const columns = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" };

  return (
    <section className="card p-6">
      <SectionTitle number="2">Payment Method</SectionTitle>

      {/* The payment options the admin has turned on (up to 3) */}
      <div className={`mt-5 grid gap-3 ${columns[options.length]}`} role="radiogroup" aria-label="Payment method">
        {options.map((option) => {
          const selected = payment.option === option.value;
          return (
            <label
              key={option.value}
              className={`relative flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition sm:flex-col sm:items-start ${
                selected ? "border-indigo-500 bg-indigo-50/60" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentOption"
                value={option.value}
                checked={selected}
                onChange={() => update({ option: option.value })}
                className="sr-only"
              />
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  selected ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                <Icon name={option.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-gray-900">{option.title}</span>
                <span className="block text-xs text-gray-500">{option.hint}</span>
              </span>
              {selected && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </label>
          );
        })}
      </div>

      {/* 1. Cash on Delivery */}
      {payment.option === "cod" && (
        <div className="mt-6 flex animate-fade-up items-start gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-800">
          <Icon name="truck" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Pay <span className="font-bold">{formatPrice(total)}</span> in cash to the delivery person when your
            order arrives. Available all over Bangladesh.
          </p>
        </div>
      )}

      {/* 2. Mobile Banking: bKash / Nagad / Rocket */}
      {payment.option === "mobile" && (
        <div className="mt-6 animate-fade-up space-y-5">
          <div className={`grid gap-2 ${["", "grid-cols-1", "grid-cols-2", "grid-cols-3"][wallets.length]}`}>
            {wallets.map((item) => {
              const selected = payment.wallet === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => update({ wallet: item.value })}
                  aria-pressed={selected}
                  className="rounded-xl border-2 px-3 py-3 text-base font-extrabold tracking-tight transition"
                  style={{
                    color: item.color,
                    borderColor: selected ? item.color : "#e5e7eb",
                    backgroundColor: selected ? `${item.color}12` : "#ffffff",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl p-4 text-sm text-gray-700" style={{ backgroundColor: `${wallet.color}0d` }}>
            <p className="font-semibold" style={{ color: wallet.color }}>
              How to pay with {wallet.label}
            </p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>Open the {wallet.label} app or dial <span className="font-mono font-semibold">{wallet.ussd}</span>.</li>
              <li>
                Choose <span className="font-semibold">Send Money</span> to{" "}
                <span className="font-mono font-semibold">{wallet.merchant}</span> (Shopio demo merchant).
              </li>
              <li>
                Amount: <span className="font-semibold">{formatPrice(total)}</span>
              </li>
              <li>Enter your {wallet.label} number and the TrxID from the confirmation SMS below.</li>
            </ol>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="walletNumber" className="label">Your {wallet.label} Number</label>
              <input
                id="walletNumber"
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                placeholder="01XXXXXXXXX"
                value={payment.walletNumber}
                onChange={(e) => update({ walletNumber: e.target.value.replace(/[^\d+]/g, "").slice(0, 14) })}
                className="input font-mono"
              />
            </div>
            <div>
              <label htmlFor="trxId" className="label">Transaction ID (TrxID)</label>
              <input
                id="trxId"
                autoComplete="off"
                placeholder="e.g. 9BC4D7E2F1"
                value={payment.trxId}
                onChange={(e) => update({ trxId: e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 20) })}
                className="input font-mono uppercase"
              />
            </div>
          </div>

          <DemoNote>
            Demo payment only — no real money is transferred. Shopio will never ask for your {wallet.label} PIN or
            OTP.
          </DemoNote>
        </div>
      )}

      {/* 3. Card / Bank */}
      {payment.option === "online" && (
        <div className="mt-6 animate-fade-up space-y-5">
          {onlineTypes.length > 1 && (
            <SegmentedControl
              value={payment.onlineType}
              onChange={(value) => update({ onlineType: value })}
              options={[
                { value: "card", label: "Credit / Debit Card", icon: "card" },
                { value: "bank", label: "Bank Transfer", icon: "bank" },
              ]}
            />
          )}

          {payment.onlineType === "card" ? (
            <>
              <div className="grid items-center gap-6 md:grid-cols-2">
                <CardPreview card={payment.card} />
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                  <div className="sm:col-span-2 md:col-span-1 lg:col-span-2">
                    <label htmlFor="cardName" className="label">Cardholder Name</label>
                    <input id="cardName" autoComplete="off" value={payment.card.name} onChange={(e) => updateCard({ name: e.target.value })} className="input" />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1 lg:col-span-2">
                    <label htmlFor="cardNumber" className="label">Card Number</label>
                    <div className="relative">
                      <input id="cardNumber" inputMode="numeric" autoComplete="off" placeholder="4242 4242 4242 4242" value={payment.card.number} onChange={(e) => updateCard({ number: formatCardNumber(e.target.value) })} className="input pr-24 font-mono" />
                      {cardBrand(digits) && (
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-700">
                          {cardBrand(digits)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cardExpiry" className="label">Expiry</label>
                    <input id="cardExpiry" inputMode="numeric" autoComplete="off" placeholder="MM/YY" value={payment.card.expiry} onChange={(e) => updateCard({ expiry: formatExpiry(e.target.value) })} className="input font-mono" />
                  </div>
                  <div>
                    <label htmlFor="cardCvv" className="label">CVV</label>
                    <input id="cardCvv" type="password" inputMode="numeric" autoComplete="off" placeholder="123" value={payment.card.cvv} onChange={(e) => updateCard({ cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} className="input font-mono" />
                  </div>
                </div>
              </div>
              <DemoNote>
                Demo payment only — no real transaction will be processed. Test card: 4242 4242 4242 4242, any
                future expiry, any 3-digit CVV. Only the last 4 digits are saved.
              </DemoNote>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Icon name="bank" className="h-5 w-5 text-indigo-600" />
                  Transfer {formatPrice(total)} to this account
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-gray-500">Bank</dt>
                  <dd className="font-medium text-gray-900">{settings.bank_name}</dd>
                  <dt className="text-gray-500">Account Name</dt>
                  <dd className="font-medium text-gray-900">{settings.bank_account_name}</dd>
                  <dt className="text-gray-500">Account No.</dt>
                  <dd className="font-mono font-medium text-gray-900">{settings.bank_account_number}</dd>
                  <dt className="text-gray-500">Branch</dt>
                  <dd className="font-medium text-gray-900">{settings.bank_branch}</dd>
                </dl>
              </div>
              <div>
                <label htmlFor="bankReference" className="label">Transaction / Reference Number</label>
                <input
                  id="bankReference"
                  autoComplete="off"
                  placeholder="e.g. FT24315XYZ01"
                  value={payment.bankReference}
                  onChange={(e) => update({ bankReference: e.target.value.replace(/[^A-Za-z0-9-]/g, "").toUpperCase().slice(0, 30) })}
                  className="input font-mono uppercase"
                />
              </div>
              <DemoNote>Demo payment only — no money is transferred in this demo store.</DemoNote>
            </>
          )}
        </div>
      )}
    </section>
  );
}
