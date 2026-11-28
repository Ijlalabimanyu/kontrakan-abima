import { Badge } from "@/components/ui";

import type { InvoiceDisplayStatus } from "@/services/invoices/interface";

interface InvoiceStatusBadgeProps {
  status: InvoiceDisplayStatus;
}

const statusConfig: Record<
  InvoiceDisplayStatus,
  {
    label: string;
    tone: "success" | "brand" | "warning" | "danger" | "neutral";
  }
> = {
  UNPAID: {
    label: "Belum Dibayar",
    tone: "warning",
  },
  PARTIAL: {
    label: "Dibayar Sebagian",
    tone: "brand",
  },
  PAID: {
    label: "Lunas",
    tone: "success",
  },
  OVERDUE: {
    label: "Terlambat",
    tone: "danger",
  },
  CANCELLED: {
    label: "Dibatalkan",
    tone: "neutral",
  },
};

export default function InvoiceStatusBadge({
  status,
}: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}
