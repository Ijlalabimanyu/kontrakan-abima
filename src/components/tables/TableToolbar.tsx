"use client";

import type { ReactNode } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import Input from "@/components/ui/Input";

export interface TableToolbarSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export interface TableToolbarProps {
  title?: ReactNode;
  description?: ReactNode;
  search?: TableToolbarSearch;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function TableToolbar({
  title,
  description,
  search,
  filters,
  actions,
  className,
}: TableToolbarProps) {
  return (
    <div
      className={["flex flex-col gap-4", className].filter(Boolean).join(" ")}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
          )}

          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          {search && (
            <Input
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              placeholder={search.placeholder ?? "Cari data..."}
              prefix={<SearchOutlined className="text-muted" />}
              suffix={search.loading ? <Spin size="small" /> : undefined}
              allowClear
              className="w-full! sm:w-64!"
            />
          )}

          {filters && (
            <div className="flex flex-wrap items-center gap-2">{filters}</div>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
