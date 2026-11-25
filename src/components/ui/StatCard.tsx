import { Statistic } from "antd";
import type { StatisticProps } from "antd";
import type { ReactNode } from "react";

import Card from "./Card";

export type StatCardTone =
  "brand" | "success" | "warning" | "danger" | "neutral";

export interface StatCardTrend {
  value: string;
  label?: string;
  tone?: StatCardTone;
}

export interface StatCardProps {
  title: ReactNode;
  value: NonNullable<StatisticProps["value"]>;
  prefix?: ReactNode;
  suffix?: ReactNode;
  precision?: number;
  formatter?: StatisticProps["formatter"];
  icon?: ReactNode;
  iconTone?: StatCardTone;
  trend?: StatCardTrend;
  description?: ReactNode;
  loading?: boolean;
  className?: string;
}

const toneStyles: Record<StatCardTone, { background: string; color: string }> =
  {
    brand: {
      background: "var(--ka-brand-soft)",
      color: "var(--ka-brand-primary)",
    },
    success: {
      background: "var(--ka-success-soft)",
      color: "var(--ka-success)",
    },
    warning: {
      background: "var(--ka-warning-soft)",
      color: "var(--ka-warning)",
    },
    danger: {
      background: "var(--ka-danger-soft)",
      color: "var(--ka-danger)",
    },
    neutral: {
      background: "var(--ka-neutral-soft)",
      color: "var(--ka-text-secondary)",
    },
  };

export default function StatCard({
  title,
  value,
  prefix,
  suffix,
  precision,
  formatter,
  icon,
  iconTone = "brand",
  trend,
  description,
  loading = false,
  className,
}: StatCardProps) {
  const iconStyle = toneStyles[iconTone];
  const trendStyle = trend ? toneStyles[trend.tone ?? "neutral"] : undefined;

  return (
    <Card
      loading={loading}
      className={["h-full", className].filter(Boolean).join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-sm font-medium text-muted">{title}</div>

          <Statistic
            value={value}
            prefix={prefix}
            suffix={suffix}
            precision={precision}
            formatter={formatter}
            groupSeparator="."
            decimalSeparator=","
            styles={{
              content: {
                fontSize: 26,
                lineHeight: 1.3,
                fontWeight: 700,
                color: "var(--ka-text-primary)",
              },
            }}
          />
        </div>

        {icon && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl"
            style={{
              backgroundColor: iconStyle.background,
              color: iconStyle.color,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {trend && (
            <>
              <span
                className="rounded-full px-2 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: trendStyle?.background,
                  color: trendStyle?.color,
                }}
              >
                {trend.value}
              </span>

              {trend.label && (
                <span className="text-xs text-muted">{trend.label}</span>
              )}
            </>
          )}

          {description && (
            <div className="text-xs text-muted">{description}</div>
          )}
        </div>
      )}
    </Card>
  );
}
