import { createClient } from "@/lib/supabase/server";

import type {
  ExpenseFilterValues,
  ExpenseModel,
} from "../interfaces/expense.interface";

export async function getExpenses(
  filters?: Partial<ExpenseFilterValues>,
): Promise<ExpenseModel[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Sesi pengguna tidak ditemukan");
  }

  let query = supabase
    .from("expenses")
    .select("*")
    .eq("owner_id", user.id)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.payment_method) {
    query = query.eq("payment_method", filters.payment_method);
  }

  if (filters?.expense_date) {
    query = query.eq("expense_date", filters.expense_date);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getExpenses error:", error);
    throw new Error("Gagal mengambil data pengeluaran");
  }

  const keyword = filters?.search?.trim().toLowerCase();
  const expenses: ExpenseModel[] = (data ?? []).map((item) => ({
    ...item,
    amount: Number(item.amount),
  }));

  if (!keyword) {
    return expenses;
  }

  return expenses.filter(
    (item) =>
      item.expense_number.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      (item.reference_number ?? "").toLowerCase().includes(keyword),
  );
}

export async function getExpenseById(id: string): Promise<ExpenseModel | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Sesi pengguna tidak ditemukan");
  }

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getExpenseById error:", error);
    throw new Error("Gagal mengambil detail pengeluaran");
  }

  if (!data) {
    return null;
  }

  return {
    ...data,
    amount: Number(data.amount),
  };
}
