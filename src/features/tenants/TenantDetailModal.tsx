"use client";

import { Descriptions } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Button, Modal } from "@/components/ui";
import type { TenantModel } from "@/services/tenants/interfaces";

interface TenantDetailModalProps {
  open: boolean;
  tenant: TenantModel | null;
  onClose: () => void;
}

export default function TenantDetailModal({
  open,
  tenant,
  onClose,
}: TenantDetailModalProps) {
  if (!tenant) return null;

  const registeredDate = dayjs(tenant.created_at).locale("id");

  return (
    <Modal
      open={open}
      title={
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">
            Detail Penyewa
          </h2>

          <p className="text-xs font-normal text-muted">
            Informasi lengkap data penyewa.
          </p>
        </div>
      }
      width="min(600px, calc(100vw - 32px))"
      centered
      footer={null}
      destroyOnHidden
      onCancel={onClose}
    >
      <div className="space-y-5">
        {/* Profile Summary */}
        <div className="flex items-center gap-3 rounded-lg bg-surface-secondary p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-primary text-lg">
            {tenant.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="wrap-break-word text-base font-bold text-foreground">
              {tenant.name}
            </h3>

            <p className="mt-1 text-xs text-muted">Data penyewa</p>
          </div>
        </div>

        {/* Tenant Information */}
        <Descriptions
          bordered
          column={1}
          size="small"
          items={[
            {
              key: "name",
              label: "Nama Lengkap",
              children: tenant.name,
            },
            {
              key: "phone",
              label: "Nomor Telepon",
              children: tenant.phone || "Belum diisi",
            },
            {
              key: "email",
              label: "Email",
              children: tenant.email || "Belum diisi",
            },
            {
              key: "identity",
              label: "Nomor Identitas",
              children: tenant.identity_number || "Belum diisi",
            },
            {
              key: "address",
              label: "Alamat",
              children: tenant.address || "Belum diisi",
            },
            {
              key: "created",
              label: "Tanggal Terdaftar",
              children: registeredDate.isValid()
                ? registeredDate.format("DD MMMM YYYY")
                : "Tanggal tidak tersedia",
            },
          ]}
        />

        <div className="flex justify-end border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
