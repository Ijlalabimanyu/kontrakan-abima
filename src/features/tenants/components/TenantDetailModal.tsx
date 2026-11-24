"use client";

import { Descriptions, Modal, Tag } from "antd";
import dayjs from "dayjs";
import { TenantModel } from "../interfaces/tenant.interfaces";

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
  return (
    <Modal
      title="Detail Penyewa"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={600}
    >
      {tenant && (
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Nama Lengkap">
            {tenant.name}
          </Descriptions.Item>

          <Descriptions.Item label="Nomor Telepon">
            {tenant.phone || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Email">
            {tenant.email || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Nomor Identitas">
            {tenant.identity_number || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Alamat">
            {tenant.address || "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Tanggal Terdaftar">
            <Tag color="blue">
              {dayjs(tenant.created_at).format("DD MMMM YYYY")}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );
}
