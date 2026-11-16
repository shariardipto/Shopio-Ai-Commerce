// Payment settings (set by the admin on /admin/payments). Server-only.
import { cache } from "react";
import { createClient } from "@/utils/supabase/server";

const COLUMNS =
  "cod_enabled, bkash_enabled, bkash_number, nagad_enabled, nagad_number, rocket_enabled, rocket_number, card_enabled, bank_enabled, bank_name, bank_account_name, bank_account_number, bank_branch";

// Used if the payment_settings table does not exist yet (schema.sql not run).
export const DEFAULT_PAYMENT_SETTINGS = {
  cod_enabled: true,
  bkash_enabled: true,
  bkash_number: "01700000001",
  nagad_enabled: true,
  nagad_number: "01700000002",
  rocket_enabled: true,
  rocket_number: "01700000003",
  card_enabled: true,
  bank_enabled: true,
  bank_name: "Demo Bank PLC",
  bank_account_name: "Shopio Ltd.",
  bank_account_number: "1234-5678-9012",
  bank_branch: "Gulshan, Dhaka",
};

// cache(): the layout, footer and page share ONE query per request.
export const getPaymentSettings = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.from("payment_settings").select(COLUMNS).eq("id", 1).maybeSingle();
  return { ...DEFAULT_PAYMENT_SETTINGS, ...(data || {}) };
});
