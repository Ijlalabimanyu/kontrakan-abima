"use client";

import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import type {
  DashboardAnalytics,
  DashboardReceivable,
} from "@/services/dashboard/interface";
import {
  formatDashboardCurrency,
  formatDashboardDate,
} from "../dashboard.utils";

interface ReceivablesSectionProps {
  receivables: DashboardReceivable[];
  kpi: Pick<
    DashboardAnalytics["kpi"],
    "outstanding_receivables" | "overdue_invoices"
  >;
  timezone: string;
}

const statusConfig: Record<
  DashboardReceivable["status"],
  {
    label: string;
    tone: "warning" | "info" | "danger";
  }
> = {
  UNPAID: {
    label: "Belum Dibayar",
    tone: "warning",
  },
  PARTIAL: {
    label: "Dibayar Sebagian",
    tone: "info",
  },
  OVERDUE: {
    label: "Terlambat",
    tone: "danger",
  },
};

function ReceivableItem({
  invoice,
  timezone,
}: {
  invoice: DashboardReceivable;
  timezone: string;
}) {
  const status = statusConfig[invoice.status];

  return (
    <div className="space-y-3 border-b border-border py-4 first:pt-0 last:border-0 last:pb-0">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {invoice.invoice_number}
          </p>

          <p className="text-xs text-muted">
            Jatuh tempo {formatDashboardDate(invoice.due_date, timezone)}
          </p>
        </div>

        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted">Total Tagihan</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {formatDashboardCurrency(invoice.amount)}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted">Sudah Dibayar</p>
          <p className="mt-1 text-sm font-medium text-success">
            {formatDashboardCurrency(invoice.paid_amount)}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs text-muted">Sisa Piutang</p>
          <p className="mt-1 text-sm font-bold text-danger">
            {formatDashboardCurrency(invoice.remaining_amount)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReceivablesSection({
  receivables,
  kpi,
  timezone,
}: ReceivablesSectionProps) {
  return (
    <Card
      className="h-full"
      title={
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Piutang Pembayaran
          </h2>

          <p className="mt-1 text-xs font-normal text-muted">
            Tagihan yang belum lunas dan perlu ditindaklanjuti.
          </p>
        </div>
      }
      extra={
        <Link
          href="/invoices"
          className="text-xs font-semibold text-brand-primary hover:underline"
        >
          Lihat Semua
        </Link>
      }
    >
      {/* Receivables Summary */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-warning-soft p-4">
          <p className="text-xs text-muted">Total Piutang</p>

          <p className="mt-2 text-lg font-bold text-warning">
            {formatDashboardCurrency(kpi.outstanding_receivables)}
          </p>
        </div>

        <div className="rounded-lg bg-danger-soft p-4">
          <p className="text-xs text-muted">Invoice Terlambat</p>

          <p className="mt-2 text-lg font-bold text-danger">
            {kpi.overdue_invoices}
          </p>
        </div>
      </div>

      {/* Invoice List */}
      {receivables.length === 0 ? (
        <EmptyState
          size="small"
          title="Tidak ada piutang"
          description="Tidak ada tagihan yang perlu ditindaklanjuti."
        />
      ) : (
        <div>
          {receivables.map((invoice) => (
            <ReceivableItem
              key={invoice.id}
              invoice={invoice}
              timezone={timezone}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
