"use client";

import { useMemo, useState } from "react";
import { Pagination } from "antd";
import dayjs from "dayjs";
import type { TableColumnsType } from "antd";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui";
import { DataTable } from "@/components/tables";
import type {
  ReceivableAging,
  ReceivableFilterValues,
  ReceivableModel,
  ReceivableStatus,
} from "@/services/finance/interface";

interface ReceivableTableProps {
  data: ReceivableModel[];
}

const initialFilters: ReceivableFilterValues = {
  search: "",
  billing_period: null,
  status: null,
  aging: null,
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const agingLabels: Record<ReceivableAging, string> = {
  NOT_DUE: "Belum Jatuh Tempo",
  "1_30": "1–30 Hari",
  "31_60": "31–60 Hari",
  OVER_60: "Lebih dari 60 Hari",
};

const agingClasses: Record<ReceivableAging, string> = {
  NOT_DUE: "bg-[#DDE8DF] text-[#173F35]",
  "1_30": "bg-amber-50 text-amber-700",
  "31_60": "bg-orange-50 text-orange-700",
  OVER_60: "bg-red-50 text-red-700",
};

function AgingBadge({ aging }: { aging: ReceivableAging }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${agingClasses[aging]}`}
    >
      {agingLabels[aging]}
    </span>
  );
}

function ReceivableStatusBadge({
  status,
  daysOverdue,
}: {
  status: ReceivableStatus;
  daysOverdue: number;
}) {
  const isOverdue = status === "OVERDUE";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        isOverdue ? "bg-red-50 text-red-700" : "bg-[#DDE8DF] text-[#173F35]"
      }`}
    >
      {isOverdue ? `Terlambat ${daysOverdue} hari` : "Belum Jatuh Tempo"}
    </span>
  );
}

export default function ReceivableTable({ data }: ReceivableTableProps) {
  const [filters, setFilters] =
    useState<ReceivableFilterValues>(initialFilters);

  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const periodOptions = useMemo(() => {
    const periods = [
      ...new Set(data.map((item) => item.billing_period.slice(0, 7))),
    ];

    return periods
      .sort((a, b) => b.localeCompare(a))
      .map((period) => ({
        label: dayjs(`${period}-01`).format("MMMM YYYY"),
        value: period,
      }));
  }, [data]);

  const filteredData = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return data.filter((item) => {
      const matchesSearch =
        !keyword ||
        [
          item.invoice_number,
          item.tenant_name,
          item.room_number,
          item.property_name ?? "",
        ].some((value) => value.toLowerCase().includes(keyword));

      const matchesPeriod =
        !filters.billing_period ||
        item.billing_period.slice(0, 7) === filters.billing_period;

      const matchesStatus =
        !filters.status || item.receivable_status === filters.status;

      const matchesAging = !filters.aging || item.aging === filters.aging;

      return matchesSearch && matchesPeriod && matchesStatus && matchesAging;
    });
  }, [data, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const currentPage = Math.min(requestedPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleFilterChange = (value: Partial<ReceivableFilterValues>) => {
    setFilters((previous) => ({
      ...previous,
      ...value,
    }));
    setRequestedPage(1);
  };

  const columns: TableColumnsType<ReceivableModel> = [
    {
      title: "No. Invoice",
      dataIndex: "invoice_number",
      key: "invoice_number",
      width: 180,
      fixed: "left",
      render: (value: string) => (
        <span className="font-medium text-[#173F35]">{value}</span>
      ),
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
      title: "Periode",
      dataIndex: "billing_period",
      key: "billing_period",
      width: 140,
      render: (value: string) =>
        dayjs(`${value.slice(0, 7)}-01`).format("MMMM YYYY"),
    },
    {
      title: "Jatuh Tempo",
      dataIndex: "due_date",
      key: "due_date",
      width: 140,
      sorter: (a, b) => a.due_date.localeCompare(b.due_date),
      render: (value: string) => dayjs(value).format("DD MMM YYYY"),
    },
    {
      title: "Total Tagihan",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 160,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Sudah Dibayar",
      dataIndex: "paid_amount",
      key: "paid_amount",
      align: "right",
      width: 160,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Sisa Piutang",
      dataIndex: "remaining_amount",
      key: "remaining_amount",
      align: "right",
      width: 160,
      sorter: (a, b) => a.remaining_amount - b.remaining_amount,
      render: (value: number) => (
        <span className="font-semibold text-[#173F35]">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 180,
      render: (_, record) => (
        <ReceivableStatusBadge
          status={record.receivable_status}
          daysOverdue={record.days_overdue}
        />
      ),
    },
    {
      title: "Aging",
      dataIndex: "aging",
      key: "aging",
      width: 170,
      render: (value: ReceivableAging) => <AgingBadge aging={value} />,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#202C26]">
          Daftar Piutang
        </h2>
        <p className="mt-1 text-sm text-[#68756D]">
          Menampilkan {filteredData.length} dari {data.length} invoice yang
          masih memiliki sisa tagihan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Input
          allowClear
          prefix={<Search size={16} />}
          placeholder="Cari invoice atau penyewa..."
          value={filters.search}
          onChange={(event) =>
            handleFilterChange({ search: event.target.value })
          }
        />

        <Select
          allowClear
          placeholder="Semua periode"
          value={filters.billing_period}
          options={periodOptions}
          onChange={(value) =>
            handleFilterChange({ billing_period: value ?? null })
          }
        />

        <Select
          allowClear
          placeholder="Semua status"
          value={filters.status}
          options={[
            { label: "Belum Jatuh Tempo", value: "NOT_DUE" },
            { label: "Terlambat", value: "OVERDUE" },
          ]}
          onChange={(value) =>
            handleFilterChange({
              status: (value as ReceivableStatus | undefined) ?? null,
            })
          }
        />

        <Select
          allowClear
          placeholder="Semua aging"
          value={filters.aging}
          options={[
            { label: "Belum Jatuh Tempo", value: "NOT_DUE" },
            { label: "1–30 Hari", value: "1_30" },
            { label: "31–60 Hari", value: "31_60" },
            { label: "Lebih dari 60 Hari", value: "OVER_60" },
          ]}
          onChange={(value) =>
            handleFilterChange({
              aging: (value as ReceivableAging | undefined) ?? null,
            })
          }
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DataTable
          rowKey="id"
          columns={columns}
          dataSource={paginatedData}
          pagination={false}
          scroll={{ x: 1500 }}
          locale={{
            emptyText: "Tidak ada data piutang",
          }}
        />
      </div>

      {/* Mobile */}
      <div className="grid grid-cols-1 gap-5 md:hidden">
        {paginatedData.length > 0 ? (
          paginatedData.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[#E6E3D9] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all text-sm font-semibold text-[#173F35]">
                    {item.invoice_number}
                  </p>
                  <p className="mt-1 text-xs text-[#68756D]">
                    {dayjs(`${item.billing_period.slice(0, 7)}-01`).format(
                      "MMMM YYYY",
                    )}
                  </p>
                </div>

                <AgingBadge aging={item.aging} />
              </div>

              <div className="mt-4">
                <p className="font-medium text-[#202C26]">{item.tenant_name}</p>
                <p className="mt-1 text-sm text-[#68756D]">
                  {item.property_name ?? "-"} · Kamar {item.room_number}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#68756D]">Jatuh tempo</p>
                  <p className="mt-1 text-sm font-medium text-[#202C26]">
                    {dayjs(item.due_date).format("DD MMM YYYY")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#68756D]">Status</p>
                  <div className="mt-1">
                    <ReceivableStatusBadge
                      status={item.receivable_status}
                      daysOverdue={item.days_overdue}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-[#E6E3D9] pt-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#68756D]">Total tagihan</span>
                  <span className="font-medium text-[#202C26]">
                    {formatCurrency(item.amount)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#68756D]">Sudah dibayar</span>
                  <span className="text-[#202C26]">
                    {formatCurrency(item.paid_amount)}
                  </span>
                </div>

                <div className="flex justify-between gap-3 border-t border-dashed border-[#E6E3D9] pt-2">
                  <span className="font-medium text-[#202C26]">
                    Sisa piutang
                  </span>
                  <span className="font-semibold text-[#173F35]">
                    {formatCurrency(item.remaining_amount)}
                  </span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[#E6E3D9] px-4 py-10 text-center text-sm text-[#68756D]">
            Tidak ada data piutang
          </div>
        )}
      </div>

      {filteredData.length > 0 && (
        <div className="flex justify-center md:justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredData.length}
            showSizeChanger
            pageSizeOptions={[10, 20, 50]}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} dari ${total} piutang`
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
