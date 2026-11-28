"use client";

import {
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Button, Card } from "@/components/ui";
import type { TenantModel } from "@/services/tenants/interfaces";
import { FormatDate } from "@/lib/utils";

interface TenantCardProps {
  tenant: TenantModel;
  disabled?: boolean;
  onDetail: (tenant: TenantModel) => void;
  onEdit: (tenant: TenantModel) => void;
  onDelete: (tenant: TenantModel) => void;
}

export default function TenantCard({
  tenant,
  disabled = false,
  onDetail,
  onEdit,
  onDelete,
}: TenantCardProps) {
  return (
    <Card className="h-full">
      <div className="space-y-4">
        {/* Tenant Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-primary">
            <UserOutlined className="text-lg" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="wrap-break-word text-base font-bold text-foreground">
              {tenant.name}
            </h3>

            <p className="mt-1 text-xs text-muted">Penyewa terdaftar</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <PhoneOutlined className="mt-1 text-muted" />
            <span className="break-all text-foreground">
              {tenant.phone || "Nomor telepon belum diisi"}
            </span>
          </div>

          {tenant.email && (
            <div className="flex items-start gap-2 text-sm">
              <MailOutlined className="mt-1 text-muted" />
              <span className="break-all text-foreground">{tenant.email}</span>
            </div>
          )}
        </div>

        {/* Registered Date */}
        <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted">
          <CalendarOutlined />
          Terdaftar {FormatDate(tenant.created_at)}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
          <Button
            variant="outline"
            size="small"
            icon={<EyeOutlined />}
            disabled={disabled}
            onClick={() => onDetail(tenant)}
          >
            Detail
          </Button>

          <Button
            variant="outline"
            size="small"
            icon={<EditOutlined />}
            disabled={disabled}
            onClick={() => onEdit(tenant)}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            size="small"
            icon={<DeleteOutlined />}
            disabled={disabled}
            onClick={() => onDelete(tenant)}
          >
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  );
}
