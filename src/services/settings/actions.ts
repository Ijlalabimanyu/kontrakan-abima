"use server";

import { revalidatePath } from "next/cache";

import type {
  BusinessSettingsFormValues,
  OwnerProfileFormValues,
  PaymentAccountFormValues,
  PreferenceFormValues,
} from "@/features/settings/interfaces/settings.interface";
import {
  businessSettingsSchema,
  ownerProfileSchema,
  passwordSchema,
  paymentAccountSchema,
  preferenceSchema,
} from "@/features/settings/schemas/settings.schema";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};

async function getContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Sesi pengguna tidak valid");
  return { supabase, user };
}

function refreshSettings() {
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

async function saveSettings(
  payload: Record<string, unknown>,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await getContext();
    const { error } = await supabase
      .from("owner_settings")
      .upsert({ owner_id: user.id, ...payload }, { onConflict: "owner_id" });
    if (error) throw new Error(error.message);
    refreshSettings();
    return { success: true, message: "Pengaturan berhasil disimpan" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menyimpan pengaturan",
    };
  }
}

export async function updateOwnerProfile(
  values: OwnerProfileFormValues,
): Promise<ActionResult> {
  const parsed = ownerProfileSchema.safeParse(values);
  return parsed.success
    ? saveSettings(parsed.data)
    : {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data tidak valid",
      };
}

export async function updateBusinessSettings(
  values: BusinessSettingsFormValues,
): Promise<ActionResult> {
  const parsed = businessSettingsSchema.safeParse(values);
  return parsed.success
    ? saveSettings(parsed.data)
    : {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data tidak valid",
      };
}

export async function updatePreferences(
  values: PreferenceFormValues,
): Promise<ActionResult> {
  const parsed = preferenceSchema.safeParse(values);
  return parsed.success
    ? saveSettings(parsed.data)
    : {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data tidak valid",
      };
}

export async function createPaymentAccount(
  values: PaymentAccountFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = paymentAccountSchema.safeParse(values);
    if (!parsed.success)
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data tidak valid",
      };
    const { supabase, user } = await getContext();
    const payload = parsed.data;
    const { data, error } = await supabase
      .from("payment_accounts")
      .insert({
        owner_id: user.id,
        account_type: payload.account_type,
        label: payload.label,
        bank_name:
          payload.account_type === "BANK_TRANSFER" ? payload.bank_name : null,
        account_name:
          payload.account_type === "BANK_TRANSFER"
            ? payload.account_name
            : null,
        account_number:
          payload.account_type === "BANK_TRANSFER"
            ? payload.account_number
            : null,
        is_active: payload.is_active,
        is_default: false,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    if (payload.is_default) {
      const { error: defaultError } = await supabase.rpc(
        "set_default_payment_account",
        { p_account_id: data.id },
      );
      if (defaultError) {
        await supabase
          .from("payment_accounts")
          .delete()
          .eq("id", data.id)
          .eq("owner_id", user.id);
        throw new Error(defaultError.message);
      }
    }
    refreshSettings();
    return {
      success: true,
      message: "Metode pembayaran berhasil ditambahkan",
      data: { id: data.id },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menambahkan metode pembayaran",
    };
  }
}

export async function updatePaymentAccount(
  id: string,
  values: PaymentAccountFormValues,
): Promise<ActionResult> {
  try {
    const parsed = paymentAccountSchema.safeParse(values);
    if (!parsed.success)
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data tidak valid",
      };
    const { supabase, user } = await getContext();
    const payload = parsed.data;
    const { data: existingAccount, error: existingError } = await supabase
      .from("payment_accounts")
      .select("qris_image_path")
      .eq("id", id)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);
    if (!existingAccount) throw new Error("Metode pembayaran tidak ditemukan");

    const { data, error } = await supabase
      .from("payment_accounts")
      .update({
        account_type: payload.account_type,
        label: payload.label,
        bank_name:
          payload.account_type === "BANK_TRANSFER" ? payload.bank_name : null,
        account_name:
          payload.account_type === "BANK_TRANSFER"
            ? payload.account_name
            : null,
        account_number:
          payload.account_type === "BANK_TRANSFER"
            ? payload.account_number
            : null,
        qris_image_path:
          payload.account_type === "BANK_TRANSFER" ? null : undefined,
        is_active: payload.is_active,
        is_default: false,
      })
      .eq("id", id)
      .eq("owner_id", user.id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Metode pembayaran tidak ditemukan");
    if (payload.is_default) {
      const { error: defaultError } = await supabase.rpc(
        "set_default_payment_account",
        { p_account_id: id },
      );
      if (defaultError) throw new Error(defaultError.message);
    }
    if (
      payload.account_type === "BANK_TRANSFER" &&
      existingAccount.qris_image_path
    ) {
      await supabase.storage
        .from("payment-qris")
        .remove([existingAccount.qris_image_path]);
    }
    refreshSettings();
    return { success: true, message: "Metode pembayaran berhasil diperbarui" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui metode pembayaran",
    };
  }
}

export async function setDefaultPaymentAccount(
  id: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await getContext();
    const { error } = await supabase.rpc("set_default_payment_account", {
      p_account_id: id,
    });
    if (error) throw new Error(error.message);
    refreshSettings();
    return {
      success: true,
      message: "Metode pembayaran default berhasil diubah",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengubah metode default",
    };
  }
}

export async function updatePaymentAccountStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await getContext();
    const { data, error } = await supabase
      .from("payment_accounts")
      .update({ is_active: isActive, is_default: false })
      .eq("id", id)
      .eq("owner_id", user.id)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Metode pembayaran tidak ditemukan");
    refreshSettings();
    return {
      success: true,
      message: "Status metode pembayaran berhasil diperbarui",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memperbarui status",
    };
  }
}

export async function deletePaymentAccount(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await getContext();
    const { data: account, error: getError } = await supabase
      .from("payment_accounts")
      .select("id, qris_image_path")
      .eq("id", id)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (getError) throw new Error(getError.message);
    if (!account) throw new Error("Metode pembayaran tidak ditemukan");
    const { error } = await supabase
      .from("payment_accounts")
      .delete()
      .eq("id", id)
      .eq("owner_id", user.id);
    if (error) throw new Error(error.message);
    if (account.qris_image_path)
      await supabase.storage
        .from("payment-qris")
        .remove([account.qris_image_path]);
    refreshSettings();
    return { success: true, message: "Metode pembayaran berhasil dihapus" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menghapus metode pembayaran",
    };
  }
}

export async function uploadQrisImage(
  accountId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await getContext();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0)
      throw new Error("File QRIS wajib dipilih");
    if (file.size > 2 * 1024 * 1024)
      throw new Error("Ukuran gambar maksimal 2 MB");
    const mimeTypes: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const extension = mimeTypes[file.type];
    if (!extension) throw new Error("Format gambar harus JPG, PNG, atau WebP");
    const { data: account, error: accountError } = await supabase
      .from("payment_accounts")
      .select("id, account_type, qris_image_path")
      .eq("id", accountId)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (accountError) throw new Error(accountError.message);
    if (!account || account.account_type !== "QRIS")
      throw new Error("Metode QRIS tidak ditemukan");
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-qris")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw new Error(uploadError.message);
    const { error: updateError } = await supabase
      .from("payment_accounts")
      .update({ qris_image_path: path })
      .eq("id", accountId)
      .eq("owner_id", user.id);
    if (updateError) {
      await supabase.storage.from("payment-qris").remove([path]);
      throw new Error(updateError.message);
    }
    if (account.qris_image_path)
      await supabase.storage
        .from("payment-qris")
        .remove([account.qris_image_path]);
    refreshSettings();
    return { success: true, message: "Gambar QRIS berhasil diunggah" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal mengunggah gambar QRIS",
    };
  }
}

export async function updateAccountPassword(values: {
  password: string;
  confirm_password: string;
}): Promise<ActionResult> {
  try {
    const parsed = passwordSchema.safeParse(values);
    if (!parsed.success)
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Password tidak valid",
      };
    const { supabase } = await getContext();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    if (error) throw new Error(error.message);
    return { success: true, message: "Password berhasil diperbarui" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memperbarui password",
    };
  }
}
