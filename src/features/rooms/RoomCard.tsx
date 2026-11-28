"use client";

import { Building2, DoorOpen, Trash2, Wallet } from "lucide-react";
import { Button, Card } from "@/components/ui";
import type { RoomModel } from "@/services/rooms/interfaces";
import RoomStatusBadge from "./RoomStatusBadge";
import { EditOutlined } from "@ant-design/icons";
import { CurrencyFormatter } from "@/lib/utils";

interface RoomCardProps {
  room: RoomModel;
  disabled?: boolean;
  onEdit: (room: RoomModel) => void;
  onDelete: (room: RoomModel) => void;
}

export default function RoomCard({
  room,
  disabled = false,
  onEdit,
  onDelete,
}: RoomCardProps) {
  return (
    <Card className="h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-primary">
              <DoorOpen size={20} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-foreground">
                Kamar {room.room_number}
              </h3>

              <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                <Building2 size={13} />
                <span className="truncate">{room.property_name}</span>
              </p>
            </div>
          </div>

          <RoomStatusBadge status={room.status} />
        </div>

        {/* Price */}
        <div className="rounded-lg bg-surface-secondary p-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Wallet size={14} />
            Harga sewa per bulan
          </div>

          <p className="mt-2 text-lg font-bold text-brand-primary">
            {CurrencyFormatter.format(room.monthly_price)}
          </p>
        </div>

        {/* Description */}
        {room.description && (
          <p className="text-sm leading-6 text-muted">{room.description}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button
            variant="outline"
            size="small"
            icon={<EditOutlined />}
            disabled={disabled}
            onClick={() => onEdit(room)}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            size="small"
            icon={<Trash2 size={14} />}
            disabled={disabled}
            onClick={() => onDelete(room)}
          >
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  );
}
