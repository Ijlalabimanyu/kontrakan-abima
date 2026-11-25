import {
  getPayableInvoices,
  getPayments,
} from "@/services/payments/payment.service";
import { getExpenses } from "@/services/expenses/service";

import type {
  FinancePageData,
  FinanceSummaryModel,
  ReceivableAging,
  ReceivableModel,
} from "./interface";

const getJakartaDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const getDaysOverdue = (dueDate: string, today: string) => {
  const due = Date.parse(`${dueDate}T00:00:00Z`);
  const current = Date.parse(`${today}T00:00:00Z`);

  return Math.max(0, Math.floor((current - due) / 86400000));
};

const getAging = (days: number): ReceivableAging => {
  if (days === 0) return "NOT_DUE";
  if (days <= 30) return "1_30";
  if (days <= 60) return "31_60";

  return "OVER_60";
};

export async function getFinancePageData(): Promise<FinancePageData> {
  const [payableInvoices, payments, expenses] = await Promise.all([
    getPayableInvoices(),
    getPayments(),
    getExpenses(),
  ]);

  const today = getJakartaDate();
  const currentMonth = today.slice(0, 7);

  const receivables: ReceivableModel[] = payableInvoices.map((invoice) => {
    const daysOverdue = getDaysOverdue(invoice.due_date, today);

    return {
      ...invoice,
      receivable_status: daysOverdue > 0 ? "OVERDUE" : "NOT_DUE",
      aging: getAging(daysOverdue),
      days_overdue: daysOverdue,
    };
  });

  const summary: FinanceSummaryModel = {
    total_receivables: 0,
    total_not_due: 0,
    total_overdue: 0,
    aging_1_30: 0,
    aging_31_60: 0,
    aging_over_60: 0,
    total_invoices: receivables.length,
    overdue_invoices: 0,
    total_income_this_month: 0,
    total_expenses_this_month: 0,
    net_profit_this_month: 0,
    total_payments_this_month: 0,
  };

  receivables.forEach((item) => {
    summary.total_receivables += item.remaining_amount;

    if (item.receivable_status === "NOT_DUE") {
      summary.total_not_due += item.remaining_amount;
      return;
    }

    summary.total_overdue += item.remaining_amount;
    summary.overdue_invoices += 1;

    if (item.aging === "1_30") {
      summary.aging_1_30 += item.remaining_amount;
    } else if (item.aging === "31_60") {
      summary.aging_31_60 += item.remaining_amount;
    } else if (item.aging === "OVER_60") {
      summary.aging_over_60 += item.remaining_amount;
    }
  });

  const paymentsThisMonth = payments.filter((payment) =>
    payment.payment_date.startsWith(currentMonth),
  );

  summary.total_income_this_month = paymentsThisMonth.reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );
  summary.total_payments_this_month = paymentsThisMonth.length;

  const expensesThisMonth = expenses.filter((expense) =>
    expense.expense_date.startsWith(currentMonth),
  );
  summary.total_expenses_this_month = expensesThisMonth.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );
  summary.net_profit_this_month =
    summary.total_income_this_month - summary.total_expenses_this_month;

  return {
    summary,
    receivables,
    payments,
    expenses,
    current_period: currentMonth,
  };
}
