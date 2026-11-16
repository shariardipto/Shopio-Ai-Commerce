"use client";

import { useState, useTransition } from "react";
import Icon from "@/components/Icon";
import { MOBILE_WALLETS } from "@/lib/shop";

// On/off switch. It is a real checkbox, so it is sent with the form as "on".
function Toggle({ name, checked, onChange, label }) {
  return (
    <label className="relative inline-flex shrink-0 cursor-pointer items-center" title={label}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} aria-label={label} className="peer sr-only" />
      <span className="h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-indigo-600 peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-100" />
      <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
    </label>
  );
}

function MethodCard({ name, enabled, onToggle, title, description, badge, children }) {
  return (
    <div className={`card p-5 transition ${enabled ? "" : "bg-gray-50/80"}`}>
      <div className="flex items-start gap-4">
        {badge}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${enabled ? "text-green-600" : "text-gray-400"}`}>
            {enabled ? "ON" : "OFF"}
          </span>
          <Toggle name={name} checked={enabled} onChange={onToggle} label={`Turn ${title} on or off`} />
        </div>
      </div>
      {/* Fields stay editable (and are saved) even when the method is off. */}
      {children && <div className={`mt-4 transition ${enabled ? "" : "opacity-50"}`}>{children}</div>}
    </div>
  );
}

function IconBadge({ icon }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
      <Icon name={icon} className="h-5 w-5" />
    </span>
  );
}

// Admin form on /admin/payments: turn methods on/off, merchant numbers, bank account.
export default function PaymentSettingsForm({ settings, action }) {
  const [enabled, setEnabled] = useState({
    cod: settings.cod_enabled,
    bkash: settings.bkash_enabled,
    nagad: settings.nagad_enabled,
    rocket: settings.rocket_enabled,
    card: settings.card_enabled,
    bank: settings.bank_enabled,
  });
  const [message, setMessage] = useState(null);
  const [isPending, startTransition] = useTransition();

  const toggle = (key) => () => setEnabled((current) => ({ ...current, [key]: !current[key] }));

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setMessage(null);
    startTransition(async () => {
      const result = await action(formData);
      setMessage(
        result?.error ? { type: "error", text: result.error } : { type: "success", text: "Payment settings saved." }
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MethodCard
        name="cod_enabled"
        enabled={enabled.cod}
        onToggle={toggle("cod")}
        title="Cash on Delivery"
        description="Customer pays the delivery person in cash."
        badge={<IconBadge icon="cash" />}
      />

      {MOBILE_WALLETS.map((wallet) => (
        <MethodCard
          key={wallet.value}
          name={`${wallet.value}_enabled`}
          enabled={enabled[wallet.value]}
          onToggle={toggle(wallet.value)}
          title={wallet.label}
          description={`Customer sends money to your ${wallet.label} number and enters the TrxID.`}
          badge={
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold"
              style={{ color: wallet.color, backgroundColor: `${wallet.color}14` }}
            >
              {wallet.label}
            </span>
          }
        >
          <label htmlFor={`${wallet.value}_number`} className="label">{wallet.label} merchant number</label>
          <input
            id={`${wallet.value}_number`}
            name={`${wallet.value}_number`}
            type="tel"
            inputMode="numeric"
            placeholder="01XXXXXXXXX"
            defaultValue={settings[`${wallet.value}_number`]}
            className="input max-w-xs font-mono"
          />
        </MethodCard>
      ))}

      <MethodCard
        name="card_enabled"
        enabled={enabled.card}
        onToggle={toggle("card")}
        title="Credit / Debit Card"
        description="Visa, Mastercard and Amex (demo card form, only the last 4 digits are saved)."
        badge={<IconBadge icon="card" />}
      />

      <MethodCard
        name="bank_enabled"
        enabled={enabled.bank}
        onToggle={toggle("bank")}
        title="Bank Transfer"
        description="Customer transfers to your bank account and enters the reference number."
        badge={<IconBadge icon="bank" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bank_name" className="label">Bank name</label>
            <input id="bank_name" name="bank_name" defaultValue={settings.bank_name} placeholder="e.g. Dutch-Bangla Bank PLC" className="input" />
          </div>
          <div>
            <label htmlFor="bank_branch" className="label">Branch</label>
            <input id="bank_branch" name="bank_branch" defaultValue={settings.bank_branch} placeholder="e.g. Gulshan, Dhaka" className="input" />
          </div>
          <div>
            <label htmlFor="bank_account_name" className="label">Account name</label>
            <input id="bank_account_name" name="bank_account_name" defaultValue={settings.bank_account_name} className="input" />
          </div>
          <div>
            <label htmlFor="bank_account_number" className="label">Account number</label>
            <input id="bank_account_number" name="bank_account_number" defaultValue={settings.bank_account_number} className="input font-mono" />
          </div>
        </div>
      </MethodCard>

      <div className="card sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:bottom-4">
        {message ? (
          <p className={`${message.type === "error" ? "alert-error" : "alert-success"} animate-fade-up py-2`}>{message.text}</p>
        ) : (
          <p className="text-sm text-gray-500">Changes apply to checkout immediately after saving.</p>
        )}
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Saving..." : "Save Payment Settings"}
        </button>
      </div>
    </form>
  );
}
