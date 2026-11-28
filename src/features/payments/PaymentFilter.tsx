"use client";

import { Search } from "lucide-react";
import dayjs from "dayjs";

import { Input, Select, DatePicker } from "@/components/ui";
import {
  PaymentFilterValues,
  PaymentMethod,
} from "@/services/payments/interface";

interface PaymentFilterProps {
  filters: PaymentFilterValues;
  onChange: (filters: PaymentFilterValues) => void;
}

const methodOptions: {
  label: string;
  value: PaymentMethod;
}[] = [
  { label: "Cash", value: "CASH" },
  { label: "Transfer", value: "TRANSFER" },
  { label: "QRIS", value: "QRIS" },
];

export default function PaymentFilter({
  filters,
  onChange,
}: PaymentFilterProps) {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-[340px_180px_200px]">
      <Input
        allowClear
        prefix={<Search size={16} />}
        className="w-full min-w-0"
        placeholder="Cari pembayaran, invoice, atau penyewa..."
        value={filters.search}
        onChange={(event) =>
          onChange({
            ...filters,
            search: event.target.value,
          })
        }
      />

      <Select
        allowClear
        className="w-full min-w-0"
        placeholder="Semua metode"
        value={filters.payment_method}
        options={methodOptions}
        onChange={(value) =>
          onChange({
            ...filters,
            payment_method: value ?? null,
          })
        }
      />

      <DatePicker
        allowClear
        className="w-full min-w-0!"
        placeholder="Semua tanggal"
        format="DD MMMM YYYY"
        value={filters.payment_date ? dayjs(filters.payment_date) : null}
        onChange={(date) =>
          onChange({
            ...filters,
            payment_date: date ? date.format("YYYY-MM-DD") : null,
          })
        }
      />
    </div>
  );
}
