"use client";

import { Table as AntTable } from "antd";
import type { TableProps } from "antd";
import type { ReactNode } from "react";
import EmptyState from "@/components/ui/EmptyState";

export interface DataTableProps<T extends object> extends Omit<
  TableProps<T>,
  "rowKey" | "locale"
> {
  rowKey: NonNullable<TableProps<T>["rowKey"]>;

  locale?: TableProps<T>["locale"];

  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
}

export default function DataTable<T extends object>({
  rowKey,
  locale,
  emptyTitle = "Belum ada data",
  emptyDescription = "Data yang tersedia akan ditampilkan di sini.",
  emptyAction,
  pagination = false,
  size = "medium",
  className,
  ...props
}: DataTableProps<T>) {
  const resolvedLocale: TableProps<T>["locale"] = {
    ...locale,
    emptyText: locale?.emptyText ?? (
      <EmptyState
        size="small"
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    ),
  };

  return (
    <AntTable<T>
      {...props}
      rowKey={rowKey}
      locale={resolvedLocale}
      pagination={pagination}
      size={size}
      className={["ka-data-table", className].filter(Boolean).join(" ")}
    />
  );
}
