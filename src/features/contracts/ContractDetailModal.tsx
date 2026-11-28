"use client";

import { Descriptions } from "antd";
import dayjs from "dayjs";
import { ContractModel } from "@/services/contract/interface";
import ContractStatusBadge from "./ContractStatusBadge";
import { Button, Modal } from "@/components/ui";
import { CurrencyFormatter } from "@/lib/utils";

interface ContractDetailModalProps {
  open: boolean;
  contract: ContractModel | null;
  onClose: () => void;
}

export default function ContractDetailModal({
  open,
  contract,
  onClose,
}: ContractDetailModalProps) {
  return (
    <Modal
      title="Detail Kontrak"
      open={open}
      onCancel={onClose}
      width={600}
      footer={false}
    >
      {contract && (
        <>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Nama Penyewa">
              {contract.tenant_name}
            </Descriptions.Item>

            <Descriptions.Item label="Nomor Telepon">
              {contract.tenant_phone || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Properti">
              {contract.property_name}
            </Descriptions.Item>

            <Descriptions.Item label="Nomor Kamar">
              {contract.room_number}
            </Descriptions.Item>

            <Descriptions.Item label="Tanggal Mulai">
              {dayjs(contract.start_date).format("DD MMMM YYYY")}
            </Descriptions.Item>

            <Descriptions.Item label="Tanggal Akhir">
              {contract.end_date
                ? dayjs(contract.end_date).format("DD MMMM YYYY")
                : "Tidak ditentukan"}
            </Descriptions.Item>

            <Descriptions.Item label="Harga Sewa / Bulan">
              {CurrencyFormatter.format(contract.monthly_price)}
            </Descriptions.Item>

            <Descriptions.Item label="Tanggal Jatuh Tempo">
              Setiap tanggal {contract.payment_due_day}
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <ContractStatusBadge status={contract.status} />
            </Descriptions.Item>
          </Descriptions>

          <div className="mt-5 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
