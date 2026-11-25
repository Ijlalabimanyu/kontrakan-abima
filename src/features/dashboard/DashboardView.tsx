import Link from "next/link";
import {
  DashboardActivity,
  DashboardAnalytics,
  DashboardFinancialTrend,
} from "@/services/dashboard/interface";
import DashboardKpiGrid from "./components/DashboardKpiGrid";

interface DashboardViewProps {
  dashboard: DashboardAnalytics;
}

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp${(value / 1_000_000_000).toFixed(1)} M`;
  }

  if (value >= 1_000_000) {
    return `Rp${(value / 1_000_000).toFixed(1)} jt`;
  }

  if (value >= 1_000) {
    return `Rp${(value / 1_000).toFixed(0)} rb`;
  }

  return formatCurrency(value);
}

function formatDate(value: string, timezone: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(value));
}

function SectionHeading({
  title,
  description,
  href,
  linkLabel = "Lihat semua",
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function OccupancyOverview({ dashboard }: { dashboard: DashboardAnalytics }) {
  const { kpi, property_occupancy } = dashboard;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeading
        title="Ringkasan okupansi"
        description="Kondisi kamar dan tingkat hunian properti."
        href="/rooms"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total kamar",
            value: kpi.total_rooms,
            color: "text-slate-900",
          },
          {
            label: "Terisi",
            value: kpi.occupied_rooms,
            color: "text-emerald-700",
          },
          {
            label: "Tersedia",
            value: kpi.available_rooms,
            color: "text-blue-700",
          },
          {
            label: "Maintenance",
            value: kpi.maintenance_rooms,
            color: "text-amber-700",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${item.color}`}>
              {numberFormatter.format(item.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Tingkat okupansi keseluruhan
          </span>
          <span className="text-sm font-semibold text-emerald-700">
            {kpi.occupancy_rate}%
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{
              width: `${Math.min(kpi.occupancy_rate, 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-7 space-y-5">
        <h3 className="text-sm font-semibold text-slate-800">
          Okupansi per properti
        </h3>

        {property_occupancy.length === 0 ? (
          <EmptyState message="Belum ada data properti." />
        ) : (
          property_occupancy.map((property) => (
            <div key={property.property_id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {property.property_name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {property.occupied_rooms} dari {property.total_rooms} kamar
                    terisi
                  </p>
                </div>

                <span className="shrink-0 text-sm font-semibold text-slate-700">
                  {property.occupancy_rate}%
                </span>
              </div>

              <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                {property.total_rooms > 0 && (
                  <>
                    <div
                      className="bg-emerald-600"
                      style={{
                        width: `${(property.occupied_rooms / property.total_rooms) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-blue-400"
                      style={{
                        width: `${(property.available_rooms / property.total_rooms) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-amber-400"
                      style={{
                        width: `${(property.maintenance_rooms / property.total_rooms) * 100}%`,
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-4">
        <Legend color="bg-emerald-600" label="Terisi" />
        <Legend color="bg-blue-400" label="Tersedia" />
        <Legend color="bg-amber-400" label="Maintenance" />
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function FinancialTrend({ trends }: { trends: DashboardFinancialTrend[] }) {
  const maxValue = Math.max(
    1,
    ...trends.flatMap((item) => [item.income, item.expenses]),
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeading
        title="Tren keuangan"
        description="Perbandingan pemasukan dan pengeluaran enam bulan terakhir."
        href="/reports"
      />

      <div className="mb-5 flex flex-wrap gap-4">
        <Legend color="bg-emerald-600" label="Pemasukan" />
        <Legend color="bg-amber-400" label="Pengeluaran" />
      </div>

      {trends.length === 0 ? (
        <EmptyState message="Belum ada data tren keuangan." />
      ) : (
        <>
          <div className="flex h-56 items-end gap-3 border-b border-slate-100 pb-3 sm:gap-5">
            {trends.map((item) => {
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
                  key={item.month}
                  className="flex h-full min-w-0 flex-1 flex-col justify-end"
                >
                  <div className="flex h-full items-end justify-center gap-1.5">
                    <div
                      title={`Pemasukan: ${formatCurrency(item.income)}`}
                      className="w-full max-w-5 rounded-t-md bg-emerald-600 transition-all"
                      style={{ height: `${incomeHeight}%` }}
                    />
                    <div
                      title={`Pengeluaran: ${formatCurrency(item.expenses)}`}
                      className="w-full max-w-5 rounded-t-md bg-amber-400 transition-all"
                      style={{ height: `${expenseHeight}%` }}
                    />
                  </div>

                  <p className="mt-3 truncate text-center text-[11px] text-slate-500 sm:text-xs">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 space-y-3">
            {trends.map((item) => (
              <div
                key={item.month}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-slate-500">{item.label}</span>

                <span
                  className={`text-right font-medium ${
                    item.net_profit >= 0 ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {formatCompactCurrency(item.net_profit)}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Angka di bawah grafik menunjukkan net profit setiap bulan.
          </p>
        </>
      )}
    </section>
  );
}

function ReceivablesSection({ dashboard }: { dashboard: DashboardAnalytics }) {
  const { receivables, kpi, timezone } = dashboard;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeading
        title="Piutang pembayaran"
        description="Tagihan yang belum lunas dan perlu ditindaklanjuti."
        href="/invoices"
      />

      <div className="mb-5 rounded-xl bg-amber-50 p-4">
        <p className="text-sm text-amber-800">Total piutang</p>
        <p className="mt-1 text-xl font-semibold text-amber-900">
          {formatCurrency(kpi.outstanding_receivables)}
        </p>
        <p className="mt-1 text-xs text-amber-700">
          {kpi.overdue_invoices} tagihan telah melewati jatuh tempo
        </p>
      </div>

      {receivables.length === 0 ? (
        <EmptyState message="Tidak ada tagihan yang perlu ditindaklanjuti." />
      ) : (
        <div className="space-y-4">
          {receivables.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {invoice.invoice_number}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Jatuh tempo {formatDate(invoice.due_date, timezone)}
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    invoice.status === "OVERDUE"
                      ? "bg-red-50 text-red-700"
                      : invoice.status === "PARTIAL"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {invoice.status === "OVERDUE"
                    ? "Terlambat"
                    : invoice.status === "PARTIAL"
                      ? "Dibayar sebagian"
                      : "Belum dibayar"}
                </span>
              </div>

              <p className="shrink-0 text-sm font-semibold text-slate-900">
                {formatCurrency(invoice.remaining_amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MaintenanceSection({ dashboard }: { dashboard: DashboardAnalytics }) {
  const { maintenance, timezone } = dashboard;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeading
        title="Maintenance"
        description="Laporan perbaikan yang masih berjalan."
        href="/maintenance"
      />

      {maintenance.length === 0 ? (
        <EmptyState message="Tidak ada maintenance yang sedang berjalan." />
      ) : (
        <div className="space-y-4">
          {maintenance.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <span className="text-lg">🔧</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {item.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {item.property_name}
                  {item.room_number ? ` • Kamar ${item.room_number}` : ""}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {item.category}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      item.status === "IN_PROGRESS"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status === "IN_PROGRESS"
                      ? "Dalam proses"
                      : "Menunggu"}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {formatDate(item.reported_at, timezone)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ActivitySection({
  activities,
  timezone,
}: {
  activities: DashboardActivity[];
  timezone: string;
}) {
  const activityConfig = {
    PAYMENT: {
      label: "Pembayaran",
      color: "bg-emerald-50 text-emerald-700",
      symbol: "↓",
    },
    EXPENSE: {
      label: "Pengeluaran",
      color: "bg-amber-50 text-amber-700",
      symbol: "↑",
    },
    MAINTENANCE: {
      label: "Maintenance",
      color: "bg-blue-50 text-blue-700",
      symbol: "🔧",
    },
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeading
        title="Aktivitas terbaru"
        description="Transaksi dan aktivitas operasional terakhir."
      />

      {activities.length === 0 ? (
        <EmptyState message="Belum ada aktivitas terbaru." />
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = activityConfig[activity.type];

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${config.color}`}
                >
                  {config.symbol}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {activity.title}
                    </p>

                    <span className="text-xs text-slate-400">
                      {config.label}
                    </span>
                  </div>

                  <p className="mt-1 break-words text-xs text-slate-500">
                    {activity.description}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(activity.date, timezone)}
                  </p>
                </div>

                {activity.amount !== null && (
                  <p
                    className={`shrink-0 text-right text-sm font-semibold ${
                      activity.type === "PAYMENT"
                        ? "text-emerald-700"
                        : "text-slate-800"
                    }`}
                  >
                    {formatCompactCurrency(activity.amount)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function QuickActions() {
  const actions = [
    {
      label: "Tambah properti",
      description: "Daftarkan properti baru",
      href: "/properties",
      symbol: "⌂",
    },
    {
      label: "Tambah penyewa",
      description: "Catat data penyewa",
      href: "/tenants",
      symbol: "＋",
    },
    {
      label: "Buat tagihan",
      description: "Kelola tagihan sewa",
      href: "/invoices",
      symbol: "▤",
    },
    {
      label: "Catat pengeluaran",
      description: "Input biaya operasional",
      href: "/finance",
      symbol: "−",
    },
    {
      label: "Laporan keuangan",
      description: "Lihat ringkasan keuangan",
      href: "/reports",
      symbol: "▥",
    },
    {
      label: "Laporan maintenance",
      description: "Pantau perbaikan properti",
      href: "/maintenance",
      symbol: "⚙",
    },
  ];

  return (
    <section>
      <SectionHeading
        title="Akses cepat"
        description="Akses fitur yang sering digunakan."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg font-semibold text-emerald-800 transition group-hover:bg-emerald-100">
              {action.symbol}
            </span>

            <p className="mt-3 text-sm font-semibold text-slate-800">
              {action.label}
            </p>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export default function DashboardView({ dashboard }: DashboardViewProps) {
  const { kpi, timezone, generated_at } = dashboard;

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Kontrakan Abima
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Ringkasan performa dan operasional properti kamu.
          </p>
        </div>

        <div className="text-xs text-slate-400 sm:text-right">
          <p>Data diperbarui</p>
          <p className="mt-1 font-medium text-slate-600">
            {formatDate(generated_at, timezone)}
          </p>
        </div>
      </header>

      <section>
        <SectionHeading
          title="Ringkasan bisnis"
          description="Kondisi properti dan performa keuangan bulan ini."
        />

        <DashboardKpiGrid kpi={dashboard.kpi} />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <OccupancyOverview dashboard={dashboard} />
        <FinancialTrend trends={dashboard.financial_trends} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReceivablesSection dashboard={dashboard} />
        <MaintenanceSection dashboard={dashboard} />
      </div>

      <ActivitySection activities={dashboard.activities} timezone={timezone} />

      <QuickActions />
    </div>
  );
}
