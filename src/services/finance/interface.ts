import type { PaymentModel } from "@/services/payments/payment.interface";
import type { ExpenseModel } from "@/services/expenses/interface";

export type ReceivableStatus = "NOT_DUE" | "OVERDUE";

export type ReceivableAging = "NOT_DUE" | "1_30" | "31_60" | "OVER_60";

export interface ReceivableModel {
  id: string;
  invoice_number: string;
  tenant_name: string;
  tenant_phone?: string;
  room_number: string;
  property_name?: string;
  billing_period: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
  receivable_status: ReceivableStatus;
  aging: ReceivableAging;
  days_overdue: number;
}

export interface ReceivableFilterValues {
  search: string;
  billing_period: string | null;
  status: ReceivableStatus | null;
  aging: ReceivableAging | null;
}

export interface FinanceSummaryModel {
  total_receivables: number;
  total_not_due: number;
  total_overdue: number;
  aging_1_30: number;
  aging_31_60: number;
  aging_over_60: number;
  total_invoices: number;
  overdue_invoices: number;
  total_income_this_month: number;
  total_expenses_this_month: number;
  net_profit_this_month: number;
  total_payments_this_month: number;
}

export interface FinancePageData {
  summary: FinanceSummaryModel;
  receivables: ReceivableModel[];
  payments: PaymentModel[];
  expenses: ExpenseModel[];
  current_period: string;
}
