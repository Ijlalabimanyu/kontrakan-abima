import { Badge } from "@/components/ui";

import type { ContractStatus } from "@/services/contract/interface";

interface ContractStatusBadgeProps {
  status: ContractStatus;
}

const statusConfig: Record<
  ContractStatus,
  {
    label: string;
    tone: "success" | "brand" | "warning";
  }
> = {
  ACTIVE: {
    label: "Aktif",
    tone: "success",
  },
  COMPLETED: {
    label: "Selesai",
    tone: "brand",
  },
  CANCELLED: {
    label: "Dibatalkan",
    tone: "warning",
  },
};

export default function ContractStatusBadge({
  status,
}: ContractStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}
