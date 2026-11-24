"use client";

import { useMemo, useState } from "react";
import { DatePicker, Tabs, Typography } from "antd";
import dayjs from "dayjs";

import type { FinancePageData } from "../interfaces/finance.interface";
import type { FinanceSummaryModel } from "../interfaces/finance.interface";
import ExpenseTable from "@/features/expenses/components/ExpenseTable";
import FinanceSummary from "./FinanceSummary";
import PaymentHistoryTable from "./PaymentHistoryTable";
import ReceivableTable from "./ReceivableTable";

interface FinancePageProps {
  data: FinancePageData;
}

export default function FinancePage({ data }: FinancePageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(data.current_period);

  const periodSummary = useMemo<FinanceSummaryModel>(() => {
    const filteredPayments = data.payments.filter((payment) =>
      payment.payment_date.startsWith(selectedPeriod),
    );
    const filteredExpenses = data.expenses.filter((expense) =>
      expense.expense_date.startsWith(selectedPeriod),
    );
    const totalIncome = filteredPayments.reduce(
      (total, payment) => total + Number(payment.amount),
      0,
    );
    const totalExpenses = filteredExpenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0,
    );

    return {
      ...data.summary,
      total_income_this_month: totalIncome,
      total_expenses_this_month: totalExpenses,
      net_profit_this_month: totalIncome - totalExpenses,
      total_payments_this_month: filteredPayments.length,
    };
  }, [data, selectedPeriod]);

  const filteredPayments = useMemo(
    () =>
      data.payments.filter((payment) =>
        payment.payment_date.startsWith(selectedPeriod),
      ),
    [data.payments, selectedPeriod],
  );

  const filteredExpenses = useMemo(
    () =>
      data.expenses.filter((expense) =>
        expense.expense_date.startsWith(selectedPeriod),
      ),
    [data.expenses, selectedPeriod],
  );

  const tabItems = [
    {
      key: "summary",
      label: "Ringkasan",
      children: <FinanceSummary summary={periodSummary} />,
    },
    {
      key: "receivables",
      label: `Piutang (${data.receivables.length})`,
      children: <ReceivableTable data={data.receivables} />,
    },
    {
      key: "income",
      label: `Pemasukan (${filteredPayments.length})`,
      children: <PaymentHistoryTable data={filteredPayments} />,
    },
    {
      key: "expenses",
      label: `Pengeluaran (${filteredExpenses.length})`,
      children: <ExpenseTable data={filteredExpenses} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title level={3} className="!mb-1">
            Keuangan
          </Typography.Title>
          <Typography.Text type="secondary">
            Pantau pemasukan, pengeluaran, keuntungan bersih, dan piutang
            kontrakan.
          </Typography.Text>
        </div>

        <DatePicker
          picker="month"
          format="MMMM YYYY"
          value={dayjs(`${selectedPeriod}-01`)}
          onChange={(value) =>
            setSelectedPeriod(
              value ? value.format("YYYY-MM") : data.current_period,
            )
          }
          allowClear={false}
          placeholder="Pilih periode"
        />
      </div>

      <Tabs
        defaultActiveKey="summary"
        items={tabItems}
        destroyOnHidden={false}
      />
    </div>
  );
}
