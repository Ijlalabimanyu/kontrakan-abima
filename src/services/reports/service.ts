import { getExpenses } from "@/services/expenses/service";
import { getPayments } from "@/services/payments/payment.service";

import type {
  ExpenseCategorySummary,
  FinancialReportData,
  IncomeMethodSummary,
  MonthlyFinancialTrend,
  ReportExpenseModel,
  ReportFilterValues,
  ReportPaymentModel,
} from "./interface";

const MONTH_LABELS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const getPeriodRange = (filter: ReportFilterValues) => {
  const startMonth = filter.period_type === "MONTHLY" ? filter.month! : 1;
  const endMonth = filter.period_type === "MONTHLY" ? filter.month! : 12;

  return {
    start: `${filter.year}-${String(startMonth).padStart(2, "0")}-01`,
    end: `${filter.year}-${String(endMonth).padStart(2, "0")}-${new Date(
      filter.year,
      endMonth,
      0,
    ).getDate()}`,
  };
};

const isWithinRange = (date: string, start: string, end: string) =>
  date >= start && date <= end;

export async function getFinancialReport(
  filter: ReportFilterValues,
): Promise<FinancialReportData> {
  const [allPayments, allExpenses] = await Promise.all([
    getPayments(),
    getExpenses(),
  ]);
  const { start, end } = getPeriodRange(filter);

  const paymentsInPeriod = allPayments.filter((payment) =>
    isWithinRange(payment.payment_date, start, end),
  );
  const expensesInPeriod = allExpenses.filter((expense) =>
    isWithinRange(expense.expense_date, start, end),
  );

  const totalIncome = paymentsInPeriod.reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );
  const totalExpenses = expensesInPeriod.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  const incomeMethodMap = new Map<string, IncomeMethodSummary>();
  paymentsInPeriod.forEach((payment) => {
    const current = incomeMethodMap.get(payment.payment_method) ?? {
      payment_method: payment.payment_method,
      total_amount: 0,
      total_transactions: 0,
    };

    current.total_amount += Number(payment.amount);
    current.total_transactions += 1;
    incomeMethodMap.set(payment.payment_method, current);
  });

  const expenseCategoryMap = new Map<string, ExpenseCategorySummary>();
  expensesInPeriod.forEach((expense) => {
    const current = expenseCategoryMap.get(expense.category) ?? {
      category: expense.category,
      total_amount: 0,
      total_transactions: 0,
    };

    current.total_amount += Number(expense.amount);
    current.total_transactions += 1;
    expenseCategoryMap.set(expense.category, current);
  });

  const trends: MonthlyFinancialTrend[] = Array.from(
    { length: 12 },
    (_, index) => {
      const month = index + 1;
      const period = `${filter.year}-${String(month).padStart(2, "0")}`;
      const monthlyIncome = allPayments
        .filter((payment) => payment.payment_date.startsWith(period))
        .reduce((total, payment) => total + Number(payment.amount), 0);
      const monthlyExpenses = allExpenses
        .filter((expense) => expense.expense_date.startsWith(period))
        .reduce((total, expense) => total + Number(expense.amount), 0);

      return {
        period,
        label: MONTH_LABELS[index],
        income: monthlyIncome,
        expenses: monthlyExpenses,
        net_profit: monthlyIncome - monthlyExpenses,
      };
    },
  );

  const payments: ReportPaymentModel[] = paymentsInPeriod.map((payment) => ({
    id: payment.id,
    payment_number: payment.payment_number,
    invoice_number: payment.invoice_number,
    payment_date: payment.payment_date,
    payment_method: payment.payment_method,
    amount: Number(payment.amount),
    tenant_name: payment.tenant_name,
    room_number: payment.room_number,
  }));

  const expenses: ReportExpenseModel[] = expensesInPeriod.map((expense) => ({
    id: expense.id,
    expense_number: expense.expense_number,
    expense_date: expense.expense_date,
    category: expense.category,
    description: expense.description,
    payment_method: expense.payment_method,
    amount: Number(expense.amount),
  }));

  return {
    filter,
    summary: {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net_profit: totalIncome - totalExpenses,
      total_transactions: paymentsInPeriod.length,
      total_expense_transactions: expensesInPeriod.length,
    },
    trends,
    income_methods: Array.from(incomeMethodMap.values()),
    expense_categories: Array.from(expenseCategoryMap.values()).sort(
      (a, b) => b.total_amount - a.total_amount,
    ),
    payments,
    expenses,
  };
}
