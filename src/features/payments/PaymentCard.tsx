"use client";

import dayjs from "dayjs";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui";
import type { PaymentModel } from "@/services/payments/interface";
import PaymentMethodBadge from "./PaymentMethodBadge";
import { CurrencyFormatter } from "@/lib/utils";

interface PaymentCardProps {
  payment: PaymentModel;
  onDetail: (payment: PaymentModel) => void;
}

export default function PaymentCard({ payment, onDetail }: PaymentCardProps) {
  return (
    <article className="rounded-2xl border border-[#E6E3D9] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[#68756D]">Nomor Pembayaran</p>
          <h3 className="mt-1 break-all text-sm font-semibold text-[#173F35]">
            {payment.payment_number}
          </h3>
        </div>

        <PaymentMethodBadge method={payment.payment_method} />
      </div>

      <div className="mt-4">
        <p className="font-semibold text-[#202C26]">{payment.tenant_name}</p>
        <p className="mt-1 text-sm text-[#68756D]">
          {payment.property_name} · Kamar {payment.room_number}
        </p>
      </div>

      <div className="my-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-[#68756D]">Nomor Invoice</p>
          <p className="mt-1 break-all text-sm font-medium text-[#202C26]">
            {payment.invoice_number}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#68756D]">Tanggal Pembayaran</p>
          <p className="mt-1 text-sm font-medium text-[#202C26]">
            {dayjs(payment.payment_date).format("DD MMM YYYY")}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-[#E6E3D9] pt-3">
        <div>
          <p className="text-xs text-[#68756D]">Nominal Pembayaran</p>
          <p className="mt-1 text-base font-semibold text-[#173F35]">
            {CurrencyFormatter.format(payment.amount)}
          </p>
        </div>

        <Button variant="outline" onClick={() => onDetail(payment)}>
          <Eye size={15} />
          Detail
        </Button>
      </div>
    </article>
  );
}
