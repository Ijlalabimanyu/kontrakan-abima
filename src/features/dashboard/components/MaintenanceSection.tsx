"use client";

import Link from "next/link";
import { ToolOutlined } from "@ant-design/icons";
import { Badge, Card, EmptyState } from "@/components/ui";
import type { DashboardMaintenance } from "@/services/dashboard/interface";
import { formatDashboardDate } from "../dashboard.utils";

interface MaintenanceSectionProps {
  maintenance: DashboardMaintenance[];
  timezone: string;
}

const statusConfig: Record<
  DashboardMaintenance["status"],
  {
    label: string;
    tone: "warning" | "info";
  }
> = {
  OPEN: {
    label: "Menunggu",
    tone: "warning",
  },
  IN_PROGRESS: {
    label: "Dalam Proses",
    tone: "info",
  },
};

function formatLabel(value: string): string {
  if (!value.trim()) {
    return "Tidak ditentukan";
  }

  return value
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function MaintenanceItem({
  item,
  timezone,
}: {
  item: DashboardMaintenance;
  timezone: string;
}) {
  const status = statusConfig[item.status];

  return (
    <div className="flex gap-3 border-b border-border py-4 first:pt-0 last:border-0 last:pb-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
        <ToolOutlined />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <p className="break-words text-sm font-semibold text-foreground">
              {item.title}
            </p>

            <p className="mt-1 text-xs text-muted">
              {item.property_name}
              {item.room_number ? ` · Kamar ${item.room_number}` : ""}
            </p>
          </div>

          <Badge tone={status.tone}>{status.label}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{formatLabel(item.category)}</Badge>

          <Badge tone="warning">Prioritas: {formatLabel(item.priority)}</Badge>
        </div>

        <p className="text-xs text-muted">
          Dilaporkan {formatDashboardDate(item.reported_at, timezone)}
        </p>
      </div>
    </div>
  );
}

export default function MaintenanceSection({
  maintenance,
  timezone,
}: MaintenanceSectionProps) {
  return (
    <Card
      className="h-full"
      title={
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Maintenance
          </h2>

          <p className="mt-1 text-xs font-normal text-muted">
            Laporan perbaikan yang masih berjalan.
          </p>
        </div>
      }
      extra={
        <Link
          href="/maintenance"
          className="text-xs font-semibold text-brand-primary hover:underline"
        >
          Lihat Semua
        </Link>
      }
    >
      {maintenance.length === 0 ? (
        <EmptyState
          size="small"
          title="Tidak ada maintenance aktif"
          description="Belum ada laporan perbaikan yang perlu ditindaklanjuti."
        />
      ) : (
        <div>
          {maintenance.map((item) => (
            <MaintenanceItem key={item.id} item={item} timezone={timezone} />
          ))}
        </div>
      )}
    </Card>
  );
}
