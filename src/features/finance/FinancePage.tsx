"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { DatePicker } from "@/components/ui";
import type {
  FinancePageData,
  FinanceSummaryModel,
} from "@/services/finance/interface";
import ExpenseTable from "@/features/expenses/ExpenseTable";
import FinanceSummary from "./FinanceSummary";
import PaymentHistoryTable from "./PaymentHistoryTable";
import ReceivableTable from "./ReceivableTable";

interface FinancePageProps {
  data: FinancePageData;
}

type FinanceTab = "summary" | "receivables" | "income" | "expenses";

export default function FinancePage({ data }: FinancePageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(data.current_period);
  const [activeTab, setActiveTab] = useState<FinanceTab>("summary");

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

  const periodSummary = useMemo<FinanceSummaryModel>(() => {
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
  }, [data.summary, filteredPayments, filteredExpenses]);

  const tabs: {
    key: FinanceTab;
    label: string;
    count?: number;
  }[] = [
    {
      key: "summary",
      label: "Ringkasan",
    },
    {
      key: "receivables",
      label: "Piutang",
      count: data.receivables.length,
    },
    {
      key: "income",
      label: "Pemasukan",
      count: filteredPayments.length,
    },
    {
      key: "expenses",
      label: "Pengeluaran",
      count: filteredExpenses.length,
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#202C26]">Keuangan</h1>
          <p className="mt-1 text-sm text-[#68756D]">
            Pantau pemasukan, pengeluaran, keuntungan bersih, dan piutang
            kontrakan.
          </p>
        </div>

        <div className="w-full sm:w-56">
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
            className="w-full"
          />
        </div>
      </div>

      {/* Navigasi tab */}
      <div
        className="grid grid-cols-2 gap-2 rounded-2xl border border-[#E6E3D9] bg-white p-3 sm:flex sm:gap-1 sm:overflow-visible sm:rounded-xl sm:p-0"
        role="tablist"
        aria-label="Menu keuangan"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-colors sm:rounded-none sm:border-b-2 sm:px-4 ${
                isActive
                  ? "bg-[#173F35] text-white sm:border-[#173F35] sm:bg-transparent sm:text-[#173F35]"
                  : "bg-[#F6F4EE] text-[#68756D] hover:text-[#202C26] sm:border-transparent sm:bg-transparent"
              }`}
            >
              <span className="truncate">{tab.label}</span>

              {tab.count !== undefined && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? "bg-white/15 text-white sm:bg-[#DDE8DF] sm:text-[#173F35]"
                      : "bg-white text-[#68756D] sm:bg-slate-100"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Konten tab: tidak dibungkus card tambahan */}
      <div className="min-w-0">
        {activeTab === "summary" && (
          <FinanceSummary
            summary={periodSummary}
            periodLabel={dayjs(`${selectedPeriod}-01`).format("MMMM YYYY")}
          />
        )}

        {activeTab === "receivables" && (
          <ReceivableTable data={data.receivables} />
        )}

        {activeTab === "income" && (
          <PaymentHistoryTable data={filteredPayments} />
        )}

        {activeTab === "expenses" && <ExpenseTable data={filteredExpenses} />}
      </div>
    </div>
  );
}
