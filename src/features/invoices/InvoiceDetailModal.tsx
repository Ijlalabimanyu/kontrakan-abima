"use client";

import { Descriptions } from "antd";
import dayjs from "dayjs";
import { Button, Modal } from "@/components/ui";
import { InvoiceModel } from "@/services/invoices/interface";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import { CurrencyFormatter } from "@/lib/utils";

interface InvoiceDetailModalProps {
  open: boolean;
  invoice: InvoiceModel | null;
  onClose: () => void;
}

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
      width={600}
      footer={null}
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs text-[#68756D]">Nomor Invoice</p>
          <p className="mt-1 break-all text-base font-semibold text-[#173F35]">
            {invoice.invoice_number}
          </p>
        </div>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Penyewa">
            {invoice.tenant_name}
          </Descriptions.Item>

          <Descriptions.Item label="Nomor Telepon">
            {invoice.tenant_phone || "-"}
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
            <span className="font-semibold text-[#173F35]">
              {CurrencyFormatter.format(invoice.amount)}
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

        <div className="mt-5 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
