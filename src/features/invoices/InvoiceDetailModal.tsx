"use client";

import { Descriptions, Modal, Typography } from "antd";
import dayjs from "dayjs";

import { InvoiceModel } from "@/services/invoices/interface";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

interface InvoiceDetailModalProps {
  open: boolean;
  invoice: InvoiceModel | null;
  onClose: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function InvoiceDetailModal({
  open,
  invoice,
  onClose,
}: InvoiceDetailModalProps) {
  if (!invoice) return null;

  return (
    <Modal
      title="Detail Invoice"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <div className="space-y-4">
        <div>
          <Typography.Text type="secondary">Nomor Invoice</Typography.Text>
          <div className="font-semibold">{invoice.invoice_number}</div>
        </div>

        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Penyewa">
            {invoice.tenant_name}
          </Descriptions.Item>
          <Descriptions.Item label="No. Telepon">
            {invoice.tenant_phone}
          </Descriptions.Item>
          <Descriptions.Item label="Properti">
            {invoice.property_name}
          </Descriptions.Item>
          <Descriptions.Item label="Kamar">
            {invoice.room_number}
          </Descriptions.Item>
          <Descriptions.Item label="Periode Tagihan">
            {dayjs(invoice.billing_period).format("MMMM YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Jatuh Tempo">
            {dayjs(invoice.due_date).format("DD MMMM YYYY")}
          </Descriptions.Item>
          <Descriptions.Item label="Nominal">
            <span className="font-semibold">
              {formatCurrency(invoice.amount)}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <InvoiceStatusBadge status={invoice.display_status} />
          </Descriptions.Item>
          <Descriptions.Item label="Catatan">
            {invoice.notes || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Dibuat">
            {dayjs(invoice.created_at).format("DD MMMM YYYY HH:mm")}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
}
