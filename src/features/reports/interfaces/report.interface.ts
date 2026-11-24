export type ReportPeriodType = "MONTHLY" | "YEARLY";

export interface ReportFilterValues {
  period_type: ReportPeriodType;
  year: number;
  month?: number;
}

export interface ReportSummary {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  total_transactions: number;
  total_expense_transactions: number;
}

export interface MonthlyFinancialTrend {
  period: string;
  label: string;
  income: number;
  expenses: number;
  net_profit: number;
}

export interface IncomeMethodSummary {
  payment_method: "CASH" | "TRANSFER" | "QRIS";
  total_amount: number;
  total_transactions: number;
}

export interface ExpenseCategorySummary {
  category:
    | "ELECTRICITY"
    | "WATER"
    | "INTERNET"
    | "MAINTENANCE"
    | "CLEANING"
    | "SUPPLIES"
    | "TAX"
    | "OTHER";
  total_amount: number;
  total_transactions: number;
}

export interface ReportPaymentModel {
  id: string;
  payment_number: string;
  invoice_number: string;
  payment_date: string;
  payment_method: "CASH" | "TRANSFER" | "QRIS";
  amount: number;
  tenant_name: string;
  room_number: string;
}

export interface ReportExpenseModel {
  id: string;
  expense_number: string;
  expense_date: string;
  category: ExpenseCategorySummary["category"];
  description: string;
  payment_method: "CASH" | "TRANSFER" | "QRIS";
  amount: number;
}

export interface FinancialReportData {
  filter: ReportFilterValues;
  summary: ReportSummary;
  trends: MonthlyFinancialTrend[];
  income_methods: IncomeMethodSummary[];
  expense_categories: ExpenseCategorySummary[];
  payments: ReportPaymentModel[];
  expenses: ReportExpenseModel[];
}
