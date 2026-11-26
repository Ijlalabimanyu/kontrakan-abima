import type { DashboardAnalytics } from "@/services/dashboard/interface";
import { formatDashboardDate } from "./dashboard.utils";
import DashboardKpiGrid from "./components/DashboardKpiGrid";
import OccupancyOverview from "./components/OccupancyOverview";
import FinancialTrend from "./components/FinancialTrend";
import ReceivablesSection from "./components/ReceivablesSection";
import MaintenanceSection from "./components/MaintenanceSection";
import ActivitySection from "./components/ActivitySection";
import QuickActions from "./components/QuickActions";

interface DashboardViewProps {
  dashboard: DashboardAnalytics;
}

export default function DashboardView({ dashboard }: DashboardViewProps) {
  const {
    kpi,
    timezone,
    generated_at,
    financial_trends,
    receivables,
    maintenance,
    activities,
  } = dashboard;

  return (
    <main className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
            Owner Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold text-foreground">Dashboard</h1>

          <p className="mt-1 text-sm text-muted">
            Ringkasan performa dan operasional properti Anda.
          </p>
        </div>

        <div className="text-xs text-muted sm:text-right">
          <p>Data diperbarui</p>

          <p className="mt-1 font-semibold text-foreground">
            {formatDashboardDate(generated_at, timezone)}
          </p>
        </div>
      </header>

      {/* Business Summary */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Ringkasan Bisnis
          </h2>

          <p className="mt-1 text-sm text-muted">
            Kondisi properti dan performa keuangan bulan ini.
          </p>
        </div>

        <DashboardKpiGrid kpi={kpi} />
      </section>

      {/* Occupancy & Financial Trend */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <OccupancyOverview dashboard={dashboard} />

        <FinancialTrend trends={financial_trends} />
      </section>

      {/* Receivables & Maintenance */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReceivablesSection
          receivables={receivables}
          kpi={{
            outstanding_receivables: kpi.outstanding_receivables,
            overdue_invoices: kpi.overdue_invoices,
          }}
          timezone={timezone}
        />

        <MaintenanceSection maintenance={maintenance} timezone={timezone} />
      </section>

      {/* Activities & Quick Actions */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ActivitySection activities={activities} timezone={timezone} />

        <QuickActions />
      </section>
    </main>
  );
}
