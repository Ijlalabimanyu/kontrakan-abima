"use client";

import dayjs from "dayjs";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui";
import { InvoiceModel } from "@/services/invoices/interface";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import { CurrencyFormatter } from "@/lib/utils";

interface InvoiceCardProps {
  invoice: InvoiceModel;
  onDetail: (invoice: InvoiceModel) => void;
}

export default function InvoiceCard({ invoice, onDetail }: InvoiceCardProps) {
  return (
    <article className="rounded-2xl border border-[#E6E3D9] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[#68756D]">Nomor Invoice</p>
          <h3 className="mt-1 break-all text-sm font-semibold text-[#173F35]">
            {invoice.invoice_number}
          </h3>
        </div>

        <InvoiceStatusBadge status={invoice.display_status} />
      </div>

      <div className="mt-4">
        <p className="font-semibold text-[#202C26]">{invoice.tenant_name}</p>
        <p className="mt-1 text-sm text-[#68756D]">
          {invoice.property_name} · Kamar {invoice.room_number}
        </p>
      </div>

      <div className="my-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-[#68756D]">Periode tagihan</p>
          <p className="mt-1 text-sm font-medium text-[#202C26]">
            {dayjs(invoice.billing_period).format("MMMM YYYY")}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#68756D]">Jatuh tempo</p>
          <p className="mt-1 text-sm font-medium text-[#202C26]">
            {dayjs(invoice.due_date).format("DD MMM YYYY")}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-[#E6E3D9] pt-3">
        <div className="min-w-0">
          <p className="text-xs text-[#68756D]">Nominal tagihan</p>
          <p className="mt-1 text-base font-semibold text-[#173F35]">
            {CurrencyFormatter.format(invoice.amount)}
          </p>
        </div>

        <Button variant="outline" onClick={() => onDetail(invoice)}>
          <Eye size={15} />
          Detail
        </Button>
      </div>
    </article>
  );
}
