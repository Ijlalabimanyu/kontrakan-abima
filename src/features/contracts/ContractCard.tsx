"use client";

import dayjs from "dayjs";
import { Eye, Pencil, CheckCircle2, XCircle } from "lucide-react";
import { Popconfirm } from "antd";
import { ContractModel } from "@/services/contract/interface";
import ContractStatusBadge from "./ContractStatusBadge";
import { Button, Card } from "@/components/ui";
import { CurrencyFormatter } from "@/lib/utils";

interface ContractCardProps {
  contract: ContractModel;
  onDetail: (contract: ContractModel) => void;
  onEdit: (contract: ContractModel) => void;
  onStatusChange: (contractId: string, action: "COMPLETE" | "CANCEL") => void;
  isPending: boolean;
}

export default function ContractCard({
  contract,
  onDetail,
  onEdit,
  onStatusChange,
  isPending,
}: ContractCardProps) {
  return (
    <Card className="h-full">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-[#202C26]">
              {contract.tenant_name}
            </h3>

            <p className="mt-1 text-sm text-[#68756D]">
              {contract.property_name} · Kamar {contract.room_number}
            </p>
          </div>

          <ContractStatusBadge status={contract.status} />
        </div>

        <div className="my-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[#68756D]">Mulai sewa</p>
            <p className="mt-1 text-sm font-medium text-[#202C26]">
              {dayjs(contract.start_date).format("DD MMM YYYY")}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#68756D]">Akhir sewa</p>
            <p className="mt-1 text-sm font-medium text-[#202C26]">
              {contract.end_date
                ? dayjs(contract.end_date).format("DD MMM YYYY")
                : "Tidak ditentukan"}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#68756D]">Harga sewa / bulan</p>
            <p className="mt-1 text-sm font-semibold text-[#173F35]">
              {CurrencyFormatter.format(contract.monthly_price)}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#68756D]">Jatuh tempo</p>
            <p className="mt-1 text-sm font-medium text-[#202C26]">
              Tanggal {contract.payment_due_day}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[#E6E3D9] pt-3">
          <Button variant="outline" onClick={() => onDetail(contract)}>
            <Eye size={15} />
            Detail
          </Button>

          {contract.status === "ACTIVE" && (
            <>
              <Button variant="outline" onClick={() => onEdit(contract)}>
                <Pencil size={15} />
                Edit
              </Button>

              <Popconfirm
                title="Selesaikan kontrak"
                description="Apakah kamu yakin ingin menyelesaikan kontrak ini?"
                okText="Ya, selesaikan"
                cancelText="Batal"
                onConfirm={() => onStatusChange(contract.id, "COMPLETE")}
              >
                <Button variant="outline" disabled={isPending}>
                  <CheckCircle2 size={15} />
                  Selesaikan
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Batalkan kontrak"
                description="Apakah kamu yakin ingin membatalkan kontrak ini?"
                okText="Ya, batalkan"
                cancelText="Batal"
                okButtonProps={{ danger: true }}
                onConfirm={() => onStatusChange(contract.id, "CANCEL")}
              >
                <Button variant="danger" disabled={isPending}>
                  <XCircle size={15} />
                  Batalkan
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
