"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { expenseSchema } from "@/services/expenses/schema";
import { createClient } from "@/lib/supabase/server";

import type { ExpenseSchemaValues } from "@/services/expenses/schema";

interface ExpenseActionResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    expense_number?: string;
  };
}

const expenseIdSchema = z.string().uuid();

const revalidateExpensePages = () => {
  revalidatePath("/finance");
  revalidatePath("/dashboard");
};

const getExpenseNumber = (expenseDate: string) => {
  const date = expenseDate.replaceAll("-", "");
  const uniqueId = randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();

  return `EXP-${date}-${uniqueId}`;
};

const normalizeExpenseValues = (values: ExpenseSchemaValues) => ({
  category: values.category,
  description: values.description,
  amount: values.amount,
  expense_date: values.expense_date,
  payment_method: values.payment_method,
  reference_number: values.reference_number || null,
  notes: values.notes || null,
});

export async function createExpense(
  values: unknown,
): Promise<ExpenseActionResponse> {
  const validation = expenseSchema.safeParse(values);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ??
        "Data pengeluaran tidak valid",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Sesi pengguna tidak ditemukan. Silakan login kembali.",
    };
  }

  const expenseNumber = getExpenseNumber(validation.data.expense_date);
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      ...normalizeExpenseValues(validation.data),
      owner_id: user.id,
      expense_number: expenseNumber,
    })
    .select("id, expense_number")
    .single();

  if (error) {
    console.error("createExpense error:", error);

    return {
      success: false,
      message: "Gagal menambahkan pengeluaran",
    };
  }

  revalidateExpensePages();

  return {
    success: true,
    message: "Pengeluaran berhasil ditambahkan",
    data,
  };
}

export async function updateExpense(
  id: string,
  values: unknown,
): Promise<ExpenseActionResponse> {
  if (!expenseIdSchema.safeParse(id).success) {
    return {
      success: false,
      message: "ID pengeluaran tidak valid",
    };
  }

  const validation = expenseSchema.safeParse(values);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ??
        "Data pengeluaran tidak valid",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Sesi pengguna tidak ditemukan. Silakan login kembali.",
    };
  }

  const { data, error } = await supabase
    .from("expenses")
    .update({
      ...normalizeExpenseValues(validation.data),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id, expense_number")
    .maybeSingle();

  if (error) {
    console.error("updateExpense error:", error);

    return {
      success: false,
      message: "Gagal memperbarui pengeluaran",
    };
  }

  if (!data) {
    return {
      success: false,
      message: "Pengeluaran tidak ditemukan atau Anda tidak memiliki akses",
    };
  }

  revalidateExpensePages();

  return {
    success: true,
    message: "Pengeluaran berhasil diperbarui",
    data,
  };
}

export async function deleteExpense(
  id: string,
): Promise<ExpenseActionResponse> {
  if (!expenseIdSchema.safeParse(id).success) {
    return {
      success: false,
      message: "ID pengeluaran tidak valid",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Sesi pengguna tidak ditemukan. Silakan login kembali.",
    };
  }

  const { data, error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("deleteExpense error:", error);

    return {
      success: false,
      message: "Gagal menghapus pengeluaran",
    };
  }

  if (!data) {
    return {
      success: false,
      message: "Pengeluaran tidak ditemukan atau Anda tidak memiliki akses",
    };
  }

  revalidateExpensePages();

  return {
    success: true,
    message: "Pengeluaran berhasil dihapus",
    data: {
      id: data.id,
    },
  };
}
