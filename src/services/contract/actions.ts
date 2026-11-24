"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { contractSchema } from "@/features/contracts/schemas/contract.schema";

export interface ContractActionState {
  success: boolean;
  message: string;
}

const initialState: ContractActionState = {
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

function validateContractData(formData: FormData) {
  return contractSchema.safeParse({
    room_id: formData.get("room_id"),
    tenant_id: formData.get("tenant_id"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date") ?? "",
    monthly_price: formData.get("monthly_price"),
    payment_due_day: formData.get("payment_due_day"),
  });
}

async function validateRoomAndTenant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  roomId: string,
  tenantId: string,
  ownerId: string,
) {
  const [roomResult, tenantResult] = await Promise.all([
    supabase
      .from("rooms")
      .select("id, status")
      .eq("id", roomId)
      .eq("owner_id", ownerId)
      .maybeSingle(),

    supabase
      .from("tenants")
      .select("id")
      .eq("id", tenantId)
      .eq("owner_id", ownerId)
      .maybeSingle(),
  ]);

  if (roomResult.error || tenantResult.error) {
    return {
      valid: false,
      message: "Gagal memvalidasi data kamar dan penyewa",
    };
  }

  if (!roomResult.data || !tenantResult.data) {
    return {
      valid: false,
      message: "Kamar atau penyewa tidak ditemukan",
    };
  }

  if (roomResult.data.status === "MAINTENANCE") {
    return {
      valid: false,
      message: "Kamar sedang maintenance dan tidak dapat disewakan",
    };
  }

  return {
    valid: true,
    message: "",
  };
}

function revalidateContractPages() {
  revalidatePath("/contracts");
  revalidatePath("/rooms");
  revalidatePath("/tenants");
  revalidatePath("/dashboard");
}

export async function createContract(
  _prevState: ContractActionState,
  formData: FormData,
): Promise<ContractActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { ...initialState, message: "Unauthorized" };
  }

  const parsed = validateContractData(formData);

  if (!parsed.success) {
    return {
      ...initialState,
      message: parsed.error.issues[0]?.message ?? "Data tidak valid",
    };
  }

  const validation = await validateRoomAndTenant(
    supabase,
    parsed.data.room_id,
    parsed.data.tenant_id,
    user.id,
  );

  if (!validation.valid) {
    return { ...initialState, message: validation.message };
  }

  const { error } = await supabase.from("rental_contracts").insert({
    owner_id: user.id,
    room_id: parsed.data.room_id,
    tenant_id: parsed.data.tenant_id,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date || null,
    monthly_price: Number(parsed.data.monthly_price),
    payment_due_day: Number(parsed.data.payment_due_day),
    status: "ACTIVE",
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ...initialState,
        message: "Kamar sudah memiliki kontrak aktif",
      };
    }

    return {
      ...initialState,
      message: error.message,
    };
  }

  revalidateContractPages();

  return {
    success: true,
    message: "Kontrak sewa berhasil dibuat",
  };
}

export async function updateContract(
  _prevState: ContractActionState,
  formData: FormData,
): Promise<ContractActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { ...initialState, message: "Unauthorized" };
  }

  const contractId = String(formData.get("id") ?? "");
  const parsed = validateContractData(formData);

  if (!contractId || !parsed.success) {
    return {
      ...initialState,
      message: parsed.success
        ? "ID kontrak tidak valid"
        : (parsed.error.issues[0]?.message ?? "Data tidak valid"),
    };
  }

  const { data: existing, error: findError } = await supabase
    .from("rental_contracts")
    .select("id, status, room_id")
    .eq("id", contractId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (findError || !existing) {
    return {
      ...initialState,
      message: "Kontrak tidak ditemukan",
    };
  }

  if (existing.status !== "ACTIVE") {
    return {
      ...initialState,
      message: "Kontrak yang sudah selesai atau dibatalkan tidak dapat diedit",
    };
  }

  const validation = await validateRoomAndTenant(
    supabase,
    parsed.data.room_id,
    parsed.data.tenant_id,
    user.id,
  );

  if (!validation.valid) {
    return { ...initialState, message: validation.message };
  }

  const { data: conflictingContract, error: conflictError } = await supabase
    .from("rental_contracts")
    .select("id")
    .eq("room_id", parsed.data.room_id)
    .eq("owner_id", user.id)
    .eq("status", "ACTIVE")
    .neq("id", contractId)
    .maybeSingle();

  if (conflictError) {
    return {
      ...initialState,
      message: "Gagal memeriksa ketersediaan kamar",
    };
  }

  if (conflictingContract) {
    return {
      ...initialState,
      message: "Kamar sudah memiliki kontrak aktif",
    };
  }

  const { error } = await supabase
    .from("rental_contracts")
    .update({
      room_id: parsed.data.room_id,
      tenant_id: parsed.data.tenant_id,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date || null,
      monthly_price: Number(parsed.data.monthly_price),
      payment_due_day: Number(parsed.data.payment_due_day),
    })
    .eq("id", contractId)
    .eq("owner_id", user.id)
    .eq("status", "ACTIVE");

  if (error) {
    if (error.code === "23505") {
      return {
        ...initialState,
        message: "Kamar sudah memiliki kontrak aktif",
      };
    }

    return {
      ...initialState,
      message: error.message,
    };
  }

  revalidateContractPages();

  return {
    success: true,
    message: "Kontrak berhasil diperbarui",
  };
}

async function updateContractStatus(
  contractId: string,
  status: "COMPLETED" | "CANCELLED",
): Promise<ContractActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { ...initialState, message: "Unauthorized" };
  }

  if (!contractId) {
    return {
      ...initialState,
      message: "ID kontrak tidak valid",
    };
  }

  const { data, error } = await supabase
    .from("rental_contracts")
    .update({ status })
    .eq("id", contractId)
    .eq("owner_id", user.id)
    .eq("status", "ACTIVE")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      ...initialState,
      message:
        error?.message ?? "Kontrak tidak ditemukan atau sudah tidak aktif",
    };
  }

  revalidateContractPages();

  return {
    success: true,
    message:
      status === "COMPLETED"
        ? "Kontrak berhasil diselesaikan"
        : "Kontrak berhasil dibatalkan",
  };
}

export async function completeContract(
  contractId: string,
): Promise<ContractActionState> {
  return updateContractStatus(contractId, "COMPLETED");
}

export async function cancelContract(
  contractId: string,
): Promise<ContractActionState> {
  return updateContractStatus(contractId, "CANCELLED");
}
