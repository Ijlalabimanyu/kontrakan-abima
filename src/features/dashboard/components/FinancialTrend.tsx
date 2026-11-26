"use client";

import Link from "next/link";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { Card, EmptyState, Badge } from "@/components/ui";

import type { DashboardFinancialTrend } from "@/services/dashboard/interface";

interface FinancialTrendProps {
  trends: DashboardFinancialTrend[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number): string {
  const compact = new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

  return `Rp${compact}`;
}

export default function FinancialTrend({ trends }: FinancialTrendProps) {
  const hasData = trends.length > 0;

  return (
    <Card
      className="h-full"
      title={
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Tren Keuangan
          </h2>

          <p className="mt-1 text-xs font-normal text-muted">
            Perbandingan pemasukan dan pengeluaran enam bulan terakhir.
          </p>
        </div>
      }
      extra={
        <Link
          href="/reports"
          className="text-xs font-semibold text-brand-primary hover:underline"
        >
          Lihat Laporan
        </Link>
      }
    >
      {!hasData ? (
        <EmptyState
          size="small"
          title="Belum ada data keuangan"
          description="Grafik akan ditampilkan setelah tersedia transaksi."
        />
      ) : (
        <div className="space-y-5">
          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-brand-primary" />
              <span className="text-xs text-muted">Pemasukan</span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: "var(--ka-accent)" }}
              />
              <span className="text-xs text-muted">Pengeluaran</span>
            </div>
          </div>

          {/* Chart */}
          <div
            className="h-65 w-full min-w-0"
            role="img"
            aria-label="Grafik perbandingan pemasukan dan pengeluaran"
          >
            <BarChart
              data={trends}
              responsive
              style={{
                width: "100%",
                height: "100%",
              }}
              margin={{
                top: 12,
                right: 8,
                left: 8,
                bottom: 4,
              }}
            >
              <CartesianGrid
                stroke="var(--ka-border)"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--ka-text-secondary)",
                  fontSize: 11,
                }}
                tickMargin={10}
              />

              <YAxis
                width={68}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) => formatCompactCurrency(value)}
                tick={{
                  fill: "var(--ka-text-secondary)",
                  fontSize: 10,
                }}
              />

              <Tooltip
                cursor={{
                  fill: "var(--ka-neutral-soft)",
                }}
                formatter={(value, name) => [
                  formatCurrency(Number(value ?? 0)),
                  name === "income" ? "Pemasukan" : "Pengeluaran",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--ka-border)",
                  background: "var(--ka-surface)",
                  fontFamily: "var(--font-manrope)",
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="income"
                name="income"
                fill="var(--ka-brand-primary)"
                radius={[5, 5, 0, 0]}
                maxBarSize={32}
              />

              <Bar
                dataKey="expenses"
                name="expenses"
                fill="var(--ka-accent)"
                radius={[5, 5, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </div>

          {/* Net Profit Summary */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                Net Profit per Bulan
              </h3>

              <Badge tone="neutral">{trends.length} Periode</Badge>
            </div>

            {trends.map((item) => (
              <div
                key={item.month}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-xs text-muted">{item.label}</span>

                <span
                  className={[
                    "text-sm font-semibold",
                    item.net_profit >= 0 ? "text-success" : "text-danger",
                  ].join(" ")}
                >
                  {formatCompactCurrency(item.net_profit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
