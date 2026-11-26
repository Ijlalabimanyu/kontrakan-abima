import { Badge } from "@/components/ui";

import type { RoomStatus } from "@/services/rooms/interfaces";

interface RoomStatusBadgeProps {
  status: RoomStatus;
}

const statusConfig: Record<
  RoomStatus,
  {
    label: string;
    tone: "success" | "brand" | "warning";
  }
> = {
  AVAILABLE: {
    label: "Tersedia",
    tone: "success",
  },
  OCCUPIED: {
    label: "Terisi",
    tone: "brand",
  },
  MAINTENANCE: {
    label: "Maintenance",
    tone: "warning",
  },
};

export default function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}
