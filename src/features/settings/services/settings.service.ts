import { createClient } from "@/lib/supabase/server";

import type {
  OwnerSettingsModel,
  PaymentAccountModel,
  SettingsPageData,
} from "../interfaces/settings.interface";

const defaultSettings = {
  owner_name: null,
  contact_phone: null,
  business_name: null,
  business_address: null,
  business_description: null,
  currency: "IDR" as const,
  timezone: "Asia/Jakarta" as const,
  date_format: "DD/MM/YYYY" as const,
};

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Sesi pengguna tidak valid");

  const [settingsResult, accountsResult] = await Promise.all([
    supabase
      .from("owner_settings")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase
      .from("payment_accounts")
      .select("*")
      .eq("owner_id", user.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);
  if (settingsResult.error) throw new Error(settingsResult.error.message);
  if (accountsResult.error) throw new Error(accountsResult.error.message);

  const settings = settingsResult.data
    ? (settingsResult.data as OwnerSettingsModel)
    : {
        ...defaultSettings,
        id: "",
        owner_id: user.id,
        created_at: "",
        updated_at: "",
      };
  const accounts = (accountsResult.data ?? []) as PaymentAccountModel[];
  const paymentAccounts = await Promise.all(
    accounts.map(async (account) => {
      if (!account.qris_image_path)
        return { ...account, qris_signed_url: null };
      const { data, error } = await supabase.storage
        .from("payment-qris")
        .createSignedUrl(account.qris_image_path, 300);
      return { ...account, qris_signed_url: error ? null : data.signedUrl };
    }),
  );

  return { settings, paymentAccounts, email: user.email ?? "" };
}
