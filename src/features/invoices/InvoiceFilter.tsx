"use client";

import { DatePicker, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { InvoiceDisplayStatus } from "@/services/invoices/interface";

interface InvoiceFilterProps {
  search: string;
  status: InvoiceDisplayStatus | null;
  billingPeriod: string | null;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: InvoiceDisplayStatus | null) => void;
  onPeriodChange: (value: string | null) => void;
}

const statusOptions: {
  label: string;
  value: InvoiceDisplayStatus;
}[] = [
  { label: "Belum Dibayar", value: "UNPAID" },
  { label: "Dibayar Sebagian", value: "PARTIAL" },
  { label: "Lunas", value: "PAID" },
  { label: "Terlambat", value: "OVERDUE" },
  { label: "Dibatalkan", value: "CANCELLED" },
];

export default function InvoiceFilter({
  search,
  status,
  billingPeriod,
  onSearchChange,
  onStatusChange,
  onPeriodChange,
}: InvoiceFilterProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Input
        allowClear
        placeholder="Cari invoice, penyewa, atau kamar"
        prefix={<SearchOutlined />}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <Select
        allowClear
        placeholder="Semua Status"
        className="w-full"
        value={status}
        options={statusOptions}
        onChange={(value) => onStatusChange(value ?? null)}
      />

      <DatePicker
        picker="month"
        format="MMMM YYYY"
        placeholder="Semua Periode"
        className="w-full"
        value={billingPeriod ? dayjs(`${billingPeriod}-01`) : null}
        onChange={(date) =>
          onPeriodChange(date ? date.format("YYYY-MM") : null)
        }
      />
    </div>
  );
}
