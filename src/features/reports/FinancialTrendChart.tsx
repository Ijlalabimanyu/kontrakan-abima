import { Card, Empty } from "antd";

import type { MonthlyFinancialTrend } from "@/services/reports/interface";

interface FinancialTrendChartProps {
  data: MonthlyFinancialTrend[];
}

const formatCompact = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export default function FinancialTrendChart({
  data,
}: FinancialTrendChartProps) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.income, item.expenses]),
  );

  return (
    <Card title="Tren Pemasukan dan Pengeluaran">
      {data.length === 0 ? (
        <Empty description="Belum ada data laporan" />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-green-500" />
              Pemasukan
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-red-400" />
              Pengeluaran
            </div>
          </div>
          <div className="grid grid-cols-6 gap-3 md:grid-cols-12">
            {data.map((item) => {
              const incomeHeight = Math.max(
                item.income > 0 ? 3 : 0,
                (item.income / maxValue) * 100,
              );
              const expenseHeight = Math.max(
                item.expenses > 0 ? 3 : 0,
                (item.expenses / maxValue) * 100,
              );

              return (
                <div
                  key={item.period}
                  className="flex min-w-0 flex-col items-center gap-2"
                >
                  <div className="flex h-44 w-full items-end justify-center gap-1 border-b border-slate-200 px-1">
                    <div
                      className="w-1/2 rounded-t bg-green-500"
                      style={{ height: `${incomeHeight}%` }}
                      title={`Pemasukan: ${formatCompact(item.income)}`}
                    />
                    <div
                      className="w-1/2 rounded-t bg-red-400"
                      style={{ height: `${expenseHeight}%` }}
                      title={`Pengeluaran: ${formatCompact(item.expenses)}`}
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    {item.label.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div>
              <span className="text-slate-500">Total pemasukan</span>
              <p className="font-semibold text-green-600">
                {formatCompact(
                  data.reduce((sum, item) => sum + item.income, 0),
                )}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Total pengeluaran</span>
              <p className="font-semibold text-red-500">
                {formatCompact(
                  data.reduce((sum, item) => sum + item.expenses, 0),
                )}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Keuntungan bersih</span>
              <p className="font-semibold">
                {formatCompact(
                  data.reduce((sum, item) => sum + item.net_profit, 0),
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
