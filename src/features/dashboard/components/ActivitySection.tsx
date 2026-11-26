"use client";

import type { ReactNode } from "react";
import {
  WalletOutlined,
  DollarOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Badge, Card, EmptyState } from "@/components/ui";
import type {
  DashboardActivity,
  DashboardActivityType,
} from "@/services/dashboard/interface";
import {
  formatDashboardDate,
  formatDashboardCompactCurrency,
} from "../dashboard.utils";

interface ActivitySectionProps {
  activities: DashboardActivity[];
  timezone: string;
}

interface ActivityConfig {
  label: string;
  tone: "success" | "warning" | "info";
  icon: ReactNode;
}

const activityConfig: Record<DashboardActivityType, ActivityConfig> = {
  PAYMENT: {
    label: "Pembayaran",
    tone: "success",
    icon: <WalletOutlined />,
  },
  EXPENSE: {
    label: "Pengeluaran",
    tone: "warning",
    icon: <DollarOutlined />,
  },
  MAINTENANCE: {
    label: "Maintenance",
    tone: "info",
    icon: <ToolOutlined />,
  },
};

export default function ActivitySection({
  activities,
  timezone,
}: ActivitySectionProps) {
  return (
    <Card
      className="h-full"
      title={
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Aktivitas Terbaru
          </h2>

          <p className="mt-1 text-xs font-normal text-muted">
            Riwayat transaksi dan aktivitas operasional.
          </p>
        </div>
      }
    >
      {activities.length === 0 ? (
        <EmptyState
          size="small"
          title="Belum ada aktivitas"
          description="Aktivitas terbaru akan ditampilkan di sini."
        />
      ) : (
        <div className="space-y-5">
          {activities.slice(0, 6).map((activity, index) => {
            const config = activityConfig[activity.type];

            return (
              <div key={activity.id} className="flex gap-3">
                {/* Activity Icon */}
                <div className="relative flex shrink-0 flex-col items-center">
                  <div
                    className={[
                      "flex h-10 w-10 items-center justify-center",
                      "rounded-full bg-brand-soft text-brand-primary",
                    ].join(" ")}
                  >
                    {config.icon}
                  </div>

                  {index < Math.min(activities.length, 6) - 1 && (
                    <div className="mt-2 min-h-5 w-px flex-1 bg-border" />
                  )}
                </div>

                {/* Activity Information */}
                <div className="min-w-0 flex-1 space-y-2 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {activity.title}
                    </p>

                    <Badge tone={config.tone}>{config.label}</Badge>
                  </div>

                  {activity.description && (
                    <p className="break-words text-xs leading-5 text-muted">
                      {activity.description}
                    </p>
                  )}

                  <p className="text-xs text-muted">
                    {formatDashboardDate(activity.date, timezone)}
                  </p>
                </div>

                {/* Transaction Amount */}
                {activity.amount !== null && (
                  <div className="shrink-0 text-right">
                    <p
                      className={[
                        "text-sm font-semibold",
                        activity.type === "PAYMENT"
                          ? "text-success"
                          : "text-foreground",
                      ].join(" ")}
                    >
                      {formatDashboardCompactCurrency(activity.amount)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
