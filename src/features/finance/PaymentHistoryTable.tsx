"use client";

import { useMemo, useState } from "react";
import { Pagination } from "antd";
import dayjs from "dayjs";
import type { TableColumnsType } from "antd";
import { DataTable } from "@/components/tables";
import type {
  PaymentMethod,
  PaymentModel,
} from "@/services/payments/interface";

interface PaymentHistoryTableProps {
  data: PaymentModel[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const methodConfig: Record<
  PaymentMethod,
  { label: string; className: string }
> = {
  CASH: {
    label: "Tunai",
    className: "bg-[#DDE8DF] text-[#173F35]",
  },
  TRANSFER: {
    label: "Transfer",
    className: "bg-blue-50 text-blue-700",
  },
  QRIS: {
    label: "QRIS",
    className: "bg-violet-50 text-violet-700",
  },
};

function PaymentMethodLabel({ method }: { method: PaymentMethod }) {
  const config = methodConfig[method];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default function PaymentHistoryTable({
  data,
}: PaymentHistoryTableProps) {
  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize]);

  const columns: TableColumnsType<PaymentModel> = [
    {
      title: "No. Pembayaran",
      dataIndex: "payment_number",
      key: "payment_number",
      width: 190,
    },
    {
      title: "Tanggal",
      dataIndex: "payment_date",
      key: "payment_date",
      width: 140,
      sorter: (a, b) => a.payment_date.localeCompare(b.payment_date),
      render: (value: string) => dayjs(value).format("DD MMM YYYY"),
    },
    {
      title: "No. Invoice",
      dataIndex: "invoice_number",
      key: "invoice_number",
      width: 180,
    },
    {
      title: "Penyewa",
      dataIndex: "tenant_name",
      key: "tenant_name",
      width: 180,
    },
    {
      title: "Kamar",
      dataIndex: "room_number",
      key: "room_number",
      width: 100,
    },
    {
      title: "Metode",
      dataIndex: "payment_method",
      key: "payment_method",
      width: 120,
      render: (value: PaymentMethod) => <PaymentMethodLabel method={value} />,
    },
    {
      title: "Nominal",
      dataIndex: "amount",
      key: "amount",
      width: 170,
      align: "right",
      sorter: (a, b) => a.amount - b.amount,
      render: (value: number) => (
        <span className="font-semibold text-[#173F35]">
          {formatCurrency(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#202C26]">
          Riwayat Pemasukan
        </h2>
        <p className="mt-1 text-sm text-[#68756D]">
          {data.length} transaksi pembayaran
        </p>
      </div>

      <div className="hidden md:block">
        <DataTable
          rowKey="id"
          columns={columns}
          dataSource={paginatedData}
          pagination={false}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: "Belum ada transaksi pembayaran",
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:hidden">
        {paginatedData.length > 0 ? (
          paginatedData.map((payment) => (
            <article
              key={payment.id}
              className="rounded-2xl border border-[#E6E3D9] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all text-sm font-semibold text-[#173F35]">
                    {payment.payment_number}
                  </p>
                  <p className="mt-1 text-xs text-[#68756D]">
                    {dayjs(payment.payment_date).format("DD MMMM YYYY")}
                  </p>
                </div>

                <PaymentMethodLabel method={payment.payment_method} />
              </div>

              <div className="mt-4">
                <p className="font-medium text-[#202C26]">
                  {payment.tenant_name}
                </p>
                <p className="mt-1 text-sm text-[#68756D]">
                  {payment.invoice_number} · {payment.property_name} · Kamar{" "}
                  {payment.room_number}
                </p>
              </div>

              <div className="mt-4 border-t border-[#E6E3D9] pt-3">
                <p className="text-xs text-[#68756D]">Nominal pembayaran</p>
                <p className="mt-1 font-semibold text-[#173F35]">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-[#E6E3D9] px-4 py-10 text-center text-sm text-[#68756D]">
            Belum ada transaksi pembayaran
          </p>
        )}
      </div>

      {data.length > 0 && (
        <div className="flex justify-center md:justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={data.length}
            showSizeChanger
            pageSizeOptions={[10, 20, 50]}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} dari ${total} transaksi`
            }
            onChange={(page, nextPageSize) => {
              setRequestedPage(page);
              setPageSize(nextPageSize);
            }}
          />
        </div>
      )}
    </div>
  );
}
