
"use client";

import { Empty as AntEmpty } from "antd";
import type { ComponentProps, ReactNode } from "react";

type AntEmptyProps = ComponentProps<typeof AntEmpty>;

export interface EmptyStateProps
  extends Omit<AntEmptyProps, "description" | "children"> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  size?: "default" | "small";
}

export default function EmptyState({
  title = "Belum ada data",
  description = "Data yang tersedia akan ditampilkan di sini.",
  action,
  size = "default",
  image,
  className,
  ...props
}: EmptyStateProps) {
  const resolvedImage =
    image !== undefined
      ? image
      : size === "small"
        ? AntEmpty.PRESENTED_IMAGE_SIMPLE
        : undefined;

  return (
    <div
      className={[
        "ka-empty-state",
        size === "small" ? "py-3" : "py-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <AntEmpty
        {...props}
        image={resolvedImage}
        description={
          <div className="space-y-1">
            {title && (
              <p className="font-semibold text-foreground">
                {title}
              </p>
            )}

            {description && (
              <p className="text-sm leading-6 text-muted">
                {description}
              </p>
            )}
          </div>
        }
      >
        {action && (
          <div className="mt-4 flex justify-center">
            {action}
          </div>
        )}
      </AntEmpty>
    </div>
  );
}
