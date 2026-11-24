import { Tag } from "antd";
import { RoomStatus } from "../interfaces/room.interfaces";

interface RoomStatusBadgeProps {
  status: RoomStatus;
}

const statusConfig: Record<RoomStatus, { label: string; color: string }> = {
  AVAILABLE: {
    label: "Tersedia",
    color: "success",
  },
  OCCUPIED: {
    label: "Terisi",
    color: "processing",
  },
  MAINTENANCE: {
    label: "Maintenance",
    color: "warning",
  },
};

export default function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  const config = statusConfig[status];

  return <Tag color={config.color}>{config.label}</Tag>;
}
