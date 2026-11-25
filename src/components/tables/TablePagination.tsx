"use client";

import { Pagination as AntPagination } from "antd";
import type { ComponentProps } from "react";

type AntPaginationProps = ComponentProps<typeof AntPagination>;

export interface TablePaginationProps extends Omit<
  AntPaginationProps,
  "current" | "pageSize" | "total" | "onChange" | "showTotal"
> {
  current: number;
  pageSize: number;
  total: number;

  onChange: (page: number, pageSize: number) => void;

  className?: string;
}

export default function TablePagination({
  current,
  pageSize,
  total,
  onChange,
  pageSizeOptions = ["10", "20", "50", "100"],
  showSizeChanger = true,
  className,
  ...props
}: TablePaginationProps) {
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  return (
    <div
      className={[
        "flex flex-col gap-3 border-t border-border py-4",
        "sm:flex-row sm:items-center sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="text-xs text-muted">
        Menampilkan {start}–{end} dari {total} data
      </span>

      <AntPagination
        {...props}
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        pageSizeOptions={pageSizeOptions}
        showSizeChanger={showSizeChanger}
        showQuickJumper={false}
        responsive
        size="medium"
      />
    </div>
  );
}
