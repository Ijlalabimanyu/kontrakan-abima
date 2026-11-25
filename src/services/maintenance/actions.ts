"use server";

import { revalidatePath } from "next/cache";

import {
  completeMaintenanceSchema,
  maintenanceSchema,
} from "@/services/maintenance/schema";
import type {
  CompleteMaintenanceValues,
  MaintenanceFormValues,
  MaintenanceStatus,
} from "@/services/maintenance/interface";
import { createClient } from "@/lib/supabase/server";

type ActionResult<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};

async function getAuthenticatedContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Sesi pengguna tidak valid");
  }

  return { supabase, user };
}

function refreshMaintenancePages() {
  revalidatePath("/maintenance");
  revalidatePath("/finance");
  revalidatePath("/dashboard");
}

async function validatePropertyAndRoom(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  propertyId: string,
  roomId: string,
) {
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (propertyError) throw new Error(propertyError.message);
  if (!property) throw new Error("Properti tidak ditemukan");

  if (!roomId) return;

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id")
    .eq("id", roomId)
    .eq("property_id", propertyId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (roomError) throw new Error(roomError.message);
  if (!room) {
    throw new Error("Kamar tidak ditemukan pada properti tersebut");
  }
}

export async function createMaintenance(
  values: MaintenanceFormValues,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = maintenanceSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data tidak valid",
      };
    }

    const { supabase, user } = await getAuthenticatedContext();
    const payload = parsed.data;
    await validatePropertyAndRoom(
      supabase,
      user.id,
      payload.property_id,
      payload.room_id,
    );

    const { data, error } = await supabase
      .from("maintenance_requests")
      .insert({
        owner_id: user.id,
        property_id: payload.property_id,
        room_id: payload.room_id || null,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        priority: payload.priority,
        scheduled_date: payload.scheduled_date || null,
        status: "OPEN",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    refreshMaintenancePages();
    return {
      success: true,
      message: "Laporan maintenance berhasil dibuat",
      data: { id: data.id },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal membuat laporan",
    };
  }
}

export async function updateMaintenance(
  id: string,
  values: MaintenanceFormValues,
): Promise<ActionResult> {
  try {
    const parsed = maintenanceSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data tidak valid",
      };
    }

    const { supabase, user } = await getAuthenticatedContext();
    const payload = parsed.data;
    await validatePropertyAndRoom(
      supabase,
      user.id,
      payload.property_id,
      payload.room_id,
    );

    const { data, error } = await supabase
      .from("maintenance_requests")
      .update({
        property_id: payload.property_id,
        room_id: payload.room_id || null,
        title: payload.title,
        description: payload.description,
        category: payload.category,
        priority: payload.priority,
        scheduled_date: payload.scheduled_date || null,
      })
      .eq("id", id)
      .eq("owner_id", user.id)
      .in("status", ["OPEN", "IN_PROGRESS"])
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      throw new Error("Laporan tidak ditemukan atau tidak dapat diedit");
    }

    refreshMaintenancePages();
    return { success: true, message: "Maintenance berhasil diperbarui" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memperbarui laporan",
    };
  }
}

export async function updateMaintenanceStatus(
  id: string,
  status: Extract<MaintenanceStatus, "IN_PROGRESS" | "CANCELLED">,
): Promise<ActionResult> {
  try {
    if (!(["IN_PROGRESS", "CANCELLED"] as const).includes(status)) {
      throw new Error("Status tidak valid");
    }

    const { supabase, user } = await getAuthenticatedContext();
    const { data, error } = await supabase
      .from("maintenance_requests")
      .update({ status })
      .eq("id", id)
      .eq("owner_id", user.id)
      .eq("status", "OPEN")
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      throw new Error("Laporan tidak ditemukan atau status tidak sesuai");
    }

    refreshMaintenancePages();
    return {
      success: true,
      message:
        status === "IN_PROGRESS"
          ? "Maintenance mulai dikerjakan"
          : "Maintenance berhasil dibatalkan",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengubah status",
    };
  }
}

export async function completeMaintenance(
  id: string,
  values: CompleteMaintenanceValues,
): Promise<ActionResult<{ expenseId: string | null }>> {
  try {
    const parsed = completeMaintenanceSchema.safeParse(values);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Data tidak valid",
      };
    }

    const { supabase } = await getAuthenticatedContext();
    const payload = parsed.data;
    const { data, error } = await supabase.rpc("complete_maintenance", {
      p_maintenance_id: id,
      p_completion_notes: payload.completion_notes || "",
      p_cost_amount: payload.cost_amount,
      p_cost_description: payload.cost_description || "",
      p_expense_date: payload.cost_amount > 0 ? payload.expense_date : null,
      p_payment_method: payload.cost_amount > 0 ? payload.payment_method : null,
      p_reference_number: payload.reference_number || "",
    });
    if (error) throw new Error(error.message);

    refreshMaintenancePages();
    return {
      success: true,
      message:
        payload.cost_amount > 0
          ? "Maintenance selesai dan pengeluaran berhasil dicatat"
          : "Maintenance berhasil diselesaikan tanpa biaya",
      data: { expenseId: data ?? null },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyelesaikan maintenance",
    };
  }
}
