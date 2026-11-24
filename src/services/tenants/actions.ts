"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { tenantSchema } from "@/features/tenants/schemas/tenant.schema";

export interface TenantActionState {
  success: boolean;
  message: string;
}

const initialState: TenantActionState = {
  success: false,
  message: "",
};

async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

function validateTenantData(formData: FormData) {
  return tenantSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    identity_number: formData.get("identity_number") ?? "",
    address: formData.get("address") ?? "",
  });
}

function normalizeTenantData(data: {
  name: string;
  phone: string;
  email: string;
  identity_number: string;
  address: string;
}) {
  return {
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    identity_number: data.identity_number || null,
    address: data.address || null,
  };
}

function handleTenantError(code?: string) {
  if (code === "23505") {
    return "Nomor identitas sudah terdaftar";
  }

  return "Terjadi kesalahan saat menyimpan data penyewa";
}

export async function createTenant(
  _prevState: TenantActionState,
  formData: FormData,
): Promise<TenantActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { ...initialState, message: "Unauthorized" };
  }

  const parsed = validateTenantData(formData);

  if (!parsed.success) {
    return {
      ...initialState,
      message: parsed.error.issues[0]?.message ?? "Data penyewa tidak valid",
    };
  }

  const { error } = await supabase.from("tenants").insert({
    ...normalizeTenantData(parsed.data),
    owner_id: user.id,
  });

  if (error) {
    return {
      ...initialState,
      message: handleTenantError(error.code),
    };
  }

  revalidatePath("/tenants");

  return {
    success: true,
    message: "Data penyewa berhasil ditambahkan",
  };
}

export async function updateTenant(
  _prevState: TenantActionState,
  formData: FormData,
): Promise<TenantActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { ...initialState, message: "Unauthorized" };
  }

  const tenantId = String(formData.get("id") ?? "");
  const parsed = validateTenantData(formData);

  if (!tenantId || !parsed.success) {
    return {
      ...initialState,
      message: parsed.success
        ? "ID penyewa tidak valid"
        : (parsed.error.issues[0]?.message ?? "Data tidak valid"),
    };
  }

  const { data, error } = await supabase
    .from("tenants")
    .update(normalizeTenantData(parsed.data))
    .eq("id", tenantId)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      ...initialState,
      message: error
        ? handleTenantError(error.code)
        : "Data penyewa tidak ditemukan",
    };
  }

  revalidatePath("/tenants");

  return {
    success: true,
    message: "Data penyewa berhasil diperbarui",
  };
}

export async function deleteTenant(
  tenantId: string,
): Promise<TenantActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { ...initialState, message: "Unauthorized" };
  }

  if (!tenantId) {
    return {
      ...initialState,
      message: "ID penyewa tidak valid",
    };
  }

  const { error } = await supabase
    .from("tenants")
    .delete()
    .eq("id", tenantId)
    .eq("owner_id", user.id);

  if (error) {
    return {
      ...initialState,
      message:
        "Penyewa tidak dapat dihapus karena masih memiliki riwayat kontrak.",
    };
  }

  revalidatePath("/tenants");

  return {
    success: true,
    message: "Data penyewa berhasil dihapus",
  };
}
