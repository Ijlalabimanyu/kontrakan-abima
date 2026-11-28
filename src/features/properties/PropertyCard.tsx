"use client";

import {
  CalendarOutlined,
  EditOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Button, Card } from "@/components/ui";
import type { PropertyModel } from "@/services/properties/interface";
import { FormatDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface PropertyCardProps {
  property: PropertyModel;
  disabled?: boolean;
  onEdit: (property: PropertyModel) => void;
  onDelete: (property: PropertyModel) => void;
}

export default function PropertyCard({
  property,
  disabled = false,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  return (
    <Card className="h-full">
      <div className="space-y-4">
        {/* Property Information */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">
            {property.name}
          </h3>

          <div className="flex items-start gap-2 text-sm text-muted">
            <EnvironmentOutlined className="mt-1 shrink-0" />

            <span>{property.address || "Alamat belum diisi"}</span>
          </div>

          {property.description && (
            <p className="text-sm leading-6 text-muted">
              {property.description}
            </p>
          )}
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted">
          <CalendarOutlined />

          <span>Terdaftar {FormatDate(property.created_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="small"
            icon={<EditOutlined />}
            disabled={disabled}
            onClick={() => onEdit(property)}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            size="small"
            icon={<Trash2 size={14} />}
            disabled={disabled}
            onClick={() => onDelete(property)}
          >
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  );
}
