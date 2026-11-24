"use client";

import { DatePicker, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { PaymentMethod } from "../interfaces/payment.interface";

interface PaymentFilterProps {
  search: string;
  paymentMethod: PaymentMethod | null;
  paymentDate: string | null;
  onSearchChange: (value: string) => void;
  onMethodChange: (value: PaymentMethod | null) => void;
  onDateChange: (value: string | null) => void;
}

const methodOptions: { label: string; value: PaymentMethod }[] = [
  { label: "Cash", value: "CASH" },
  { label: "Transfer", value: "TRANSFER" },
  { label: "QRIS", value: "QRIS" },
];

export default function PaymentFilter({
  search,
  paymentMethod,
  paymentDate,
  onSearchChange,
  onMethodChange,
  onDateChange,
}: PaymentFilterProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Cari pembayaran, invoice, penyewa..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <Select
        allowClear
        className="w-full"
        placeholder="Semua Metode"
        value={paymentMethod}
        options={methodOptions}
        onChange={(value) => onMethodChange(value ?? null)}
      />

      <DatePicker
        allowClear
        className="w-full"
        placeholder="Semua Tanggal"
        format="DD MMMM YYYY"
        value={paymentDate ? dayjs(paymentDate) : null}
        onChange={(date) =>
          onDateChange(date ? date.format("YYYY-MM-DD") : null)
        }
      />
    </div>
  );
}
