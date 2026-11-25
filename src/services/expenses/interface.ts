export type ExpenseCategory =
  | "ELECTRICITY"
  | "WATER"
  | "INTERNET"
  | "MAINTENANCE"
  | "CLEANING"
  | "SUPPLIES"
  | "TAX"
  | "OTHER";

export type ExpensePaymentMethod = "CASH" | "TRANSFER" | "QRIS";

export interface ExpenseModel {
  id: string;
  owner_id: string;
  expense_number: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: ExpensePaymentMethod;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFormValues {
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: ExpensePaymentMethod;
  reference_number?: string;
  notes?: string;
}

export interface ExpenseFilterValues {
  search: string;
  category: ExpenseCategory | null;
  payment_method: ExpensePaymentMethod | null;
  expense_date: string | null;
}
