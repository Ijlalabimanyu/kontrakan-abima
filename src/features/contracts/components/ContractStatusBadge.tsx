import { Tag } from "antd";
import { ContractStatus } from "../interfaces/contract.interface";

interface ContractStatusBadgeProps {
  status: ContractStatus;
}

const statusConfig: Record<
  ContractStatus,
  { label: string; color: string }
> = {
  ACTIVE: {
    label: "Aktif",
    color: "success",
  },
  COMPLETED: {
    label: "Selesai",
    color: "default",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "error",
  },
};

export default function ContractStatusBadge({
  status,
}: ContractStatusBadgeProps) {
  const config = statusConfig[status];

  return <Tag color={config.color}>{config.label}</Tag>;
}
