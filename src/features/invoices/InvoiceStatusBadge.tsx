import { Tag } from "antd";

import { InvoiceDisplayStatus } from "@/services/invoices/interface";

interface InvoiceStatusBadgeProps {
  status: InvoiceDisplayStatus;
}

const statusConfig: Record<
  InvoiceDisplayStatus,
  { label: string; color: string }
> = {
  UNPAID: {
    label: "Belum Dibayar",
    color: "warning",
  },
  PARTIAL: {
    label: "Dibayar Sebagian",
    color: "processing",
  },
  PAID: {
    label: "Lunas",
    color: "success",
  },
  OVERDUE: {
    label: "Terlambat",
    color: "error",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "default",
  },
};

export default function InvoiceStatusBadge({
  status,
}: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];

  return <Tag color={config.color}>{config.label}</Tag>;
}
