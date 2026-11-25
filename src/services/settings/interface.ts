export type SettingsTimezone =
  "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura";

export type SettingsDateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

export type PaymentAccountType = "BANK_TRANSFER" | "QRIS";

export interface OwnerSettingsModel {
  id: string;
  owner_id: string;
  owner_name: string | null;
  contact_phone: string | null;
  business_name: string | null;
  business_address: string | null;
  business_description: string | null;
  currency: "IDR";
  timezone: SettingsTimezone;
  date_format: SettingsDateFormat;
  created_at: string;
  updated_at: string;
}

export interface OwnerProfileFormValues {
  owner_name: string;
  contact_phone: string;
}

export interface BusinessSettingsFormValues {
  business_name: string;
  business_address: string;
  business_description: string;
}

export interface PreferenceFormValues {
  currency: "IDR";
  timezone: SettingsTimezone;
  date_format: SettingsDateFormat;
}

export interface PaymentAccountModel {
  id: string;
  owner_id: string;
  account_type: PaymentAccountType;
  label: string;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  qris_image_path: string | null;
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  qris_signed_url?: string | null;
}

export interface PaymentAccountFormValues {
  account_type: PaymentAccountType;
  label: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  is_active: boolean;
  is_default: boolean;
}

export interface SettingsPageData {
  settings: OwnerSettingsModel;
  paymentAccounts: PaymentAccountModel[];
  email: string;
}
