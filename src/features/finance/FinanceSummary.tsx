import {
  AlertTriangle,
  FileText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import type { FinanceSummaryModel } from "@/services/finance/interface";

interface FinanceSummaryProps {
  summary: FinanceSummaryModel;
  periodLabel: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const agingItems = [
  {
    key: "not_due",
    label: "Belum Jatuh Tempo",
    valueKey: "total_not_due",
    className: "bg-[#DDE8DF] text-[#173F35]",
    dotClass: "bg-[#2D7B57]",
  },
  {
    key: "1_30",
    label: "1–30 Hari",
    valueKey: "aging_1_30",
    className: "bg-amber-50 text-amber-800",
    dotClass: "bg-amber-500",
  },
  {
    key: "31_60",
    label: "31–60 Hari",
    valueKey: "aging_31_60",
    className: "bg-orange-50 text-orange-800",
    dotClass: "bg-orange-500",
  },
  {
    key: "over_60",
    label: "Lebih dari 60 Hari",
    valueKey: "aging_over_60",
    className: "bg-red-50 text-red-700",
    dotClass: "bg-red-500",
  },
] as const;

export default function FinanceSummary({
  summary,
  periodLabel,
}: FinanceSummaryProps) {
  const cards = [
    {
      title: "Total Piutang",
      value: formatCurrency(summary.total_receivables),
      description: "Sisa tagihan seluruh periode",
      icon: FileText,
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      title: "Piutang Terlambat",
      value: formatCurrency(summary.total_overdue),
      description: `${summary.overdue_invoices} invoice terlambat`,
      icon: AlertTriangle,
      iconClass: "bg-red-50 text-red-700",
    },
    {
      title: "Total Pemasukan",
      value: formatCurrency(summary.total_income_this_month),
      description: periodLabel,
      icon: Wallet,
      iconClass: "bg-[#DDE8DF] text-[#173F35]",
    },
    {
      title: "Total Pengeluaran",
      value: formatCurrency(summary.total_expenses_this_month),
      description: periodLabel,
      icon: TrendingDown,
      iconClass: "bg-orange-50 text-orange-700",
    },
    {
      title: "Keuntungan Bersih",
      value: formatCurrency(summary.net_profit_this_month),
      description: periodLabel,
      icon: TrendingUp,
      iconClass:
        summary.net_profit_this_month >= 0
          ? "bg-[#DDE8DF] text-[#173F35]"
          : "bg-red-50 text-red-700",
      valueClass:
        summary.net_profit_this_month >= 0 ? "text-[#173F35]" : "text-red-700",
    },
    {
      title: "Invoice Belum Lunas",
      value: summary.total_invoices.toLocaleString("id-ID"),
      description: `${summary.overdue_invoices} invoice terlambat`,
      icon: FileText,
      iconClass: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-[#202C26]">
          Ringkasan Keuangan
        </h2>
        <p className="mt-1 text-sm text-[#68756D]">
          Pemasukan dan pengeluaran untuk {periodLabel}. Piutang dihitung dari
          seluruh invoice yang masih memiliki sisa tagihan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-[#E6E3D9] bg-white p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-[#68756D]">{card.title}</p>

                  <p
                    className={`mt-3 wrap-break-word text-lg font-semibold tabular-nums sm:text-xl ${
                      card.valueClass ?? "text-[#202C26]"
                    }`}
                  >
                    {card.value}
                  </p>

                  <p className="mt-2 text-xs text-[#68756D]">
                    {card.description}
                  </p>
                </div>

                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
                >
                  <Icon size={19} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="rounded-2xl border border-[#E6E3D9] bg-white p-4 sm:p-5">
        <div className="mb-5">
          <h3 className="font-semibold text-[#202C26]">Aging Piutang</h3>
          <p className="mt-1 text-sm text-[#68756D]">
            Pengelompokan sisa tagihan berdasarkan keterlambatan pembayaran.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {agingItems.map((item) => (
            <div key={item.key} className={`rounded-xl p-4 ${item.className}`}>
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${item.dotClass}`} />
                <p className="text-sm font-medium">{item.label}</p>
              </div>

              <p className="mt-3 wrap-break-word text-lg font-semibold tabular-nums">
                {formatCurrency(summary[item.valueKey])}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#E6E3D9] pt-4 text-sm text-[#68756D]">
          <span>{summary.total_invoices} invoice belum lunas</span>

          <span>{summary.overdue_invoices} invoice terlambat</span>

          <span>
            {summary.total_payments_this_month} transaksi pembayaran pada{" "}
            {periodLabel}
          </span>
        </div>
      </section>
    </div>
  );
}
