"use client";

import { Search } from "lucide-react";
import dayjs from "dayjs";

import { Input, Select, DatePicker } from "@/components/ui";

import type {
  InvoiceDisplayStatus,
  InvoiceFilterValues,
} from "@/services/invoices/interface";

interface InvoiceFilterProps {
  filters: InvoiceFilterValues;
  onChange: (filters: InvoiceFilterValues) => void;
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
  filters,
  onChange,
}: InvoiceFilterProps) {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(290px,1fr)_200px_220px]">
      {/* Search */}
      <Input
        allowClear
        className="w-full min-w-0"
        prefix={<Search size={16} />}
        placeholder="Cari invoice, penyewa, atau kamar..."
        value={filters.search}
        onChange={(event) =>
          onChange({
            ...filters,
            search: event.target.value,
          })
        }
      />

      {/* Status */}
      <Select
        allowClear
        className="w-full min-w-0"
        placeholder="Semua status"
        value={filters.status}
        options={statusOptions}
        onChange={(value) =>
          onChange({
            ...filters,
            status: value ?? null,
          })
        }
      />

      {/* Billing Period */}
      <DatePicker
        picker="month"
        format="MMMM YYYY"
        placeholder="Semua periode"
        className="w-full min-w-0!"
        value={
          filters.billing_period ? dayjs(`${filters.billing_period}-01`) : null
        }
        onChange={(date) =>
          onChange({
            ...filters,
            billing_period: date ? date.format("YYYY-MM") : null,
          })
        }
      />
    </div>
  );
}
