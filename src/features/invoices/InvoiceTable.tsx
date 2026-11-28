"use client";

import { useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, EmptyState } from "@/components/ui";
import { DataTable, TablePagination, TableToolbar } from "@/components/tables";
import type {
  InvoiceDisplayStatus,
  InvoiceFilterValues,
  InvoiceModel,
} from "@/services/invoices/interface";
import InvoiceDetailModal from "./InvoiceDetailModal";
import InvoiceFilter from "./InvoiceFilter";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import GenerateInvoiceModal from "./GenerateInvoiceModal";
import InvoiceCard from "./InvoiceCard";
import { CurrencyFormatter } from "@/lib/utils";

interface InvoiceTableProps {
  invoices: InvoiceModel[];
}

const initialFilters: InvoiceFilterValues = {
  search: "",
  status: null,
  billing_period: null,
};

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  // Filters
  const [filters, setFilters] = useState<InvoiceFilterValues>(initialFilters);

  // Pagination
  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceModel | null>(
    null,
  );

  // Filtering
  const filteredInvoices = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !keyword ||
        [
          invoice.invoice_number,
          invoice.tenant_name,
          invoice.tenant_phone,
          invoice.room_number,
          invoice.property_name,
        ].some((value) => value.toLowerCase().includes(keyword));

      const matchesStatus =
        !filters.status || invoice.display_status === filters.status;

      const matchesPeriod =
        !filters.billing_period ||
        invoice.billing_period.slice(0, 7) === filters.billing_period;

      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [invoices, filters]);

  const handleFilterChange = (value: InvoiceFilterValues) => {
    setFilters(value);
    setRequestedPage(1);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(startIndex, startIndex + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const handleDetail = (invoice: InvoiceModel) => {
    setSelectedInvoice(invoice);
  };

  // Table Columns
  const columns: ColumnsType<InvoiceModel> = [
    {
      title: "No. Invoice",
      dataIndex: "invoice_number",
      key: "invoice_number",
      width: 170,
      render: (value: string) => (
        <span className="font-semibold text-foreground">{value}</span>
      ),
    },
    {
      title: "Penyewa",
      dataIndex: "tenant_name",
      key: "tenant_name",
      width: 180,
    },
    {
      title: "Properti / Kamar",
      key: "room",
      width: 200,
      render: (_, record) => (
        <div>
          <p className="font-medium text-foreground">{record.property_name}</p>
          <p className="text-xs text-muted">Kamar {record.room_number}</p>
        </div>
      ),
    },
    {
      title: "Periode",
      dataIndex: "billing_period",
      key: "billing_period",
      width: 140,
      render: (value: string) => dayjs(value).format("MMMM YYYY"),
    },
    {
      title: "Jatuh Tempo",
      dataIndex: "due_date",
      key: "due_date",
      width: 130,
      render: (value: string) => dayjs(value).format("DD MMMM YYYY"),
    },
    {
      title: "Nominal",
      dataIndex: "amount",
      key: "amount",
      width: 170,
      align: "right",
      render: (value: number) => (
        <span className="font-medium text-foreground">
          {CurrencyFormatter.format(value)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "display_status",
      key: "display_status",
      width: 140,
      render: (value: InvoiceDisplayStatus) => (
        <InvoiceStatusBadge status={value} />
      ),
    },
    {
      title: "Aksi",
      key: "action",
      fixed: "right",
      width: 90,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="small"
            icon={<EyeOutlined />}
            aria-label={`Detail invoice ${record.invoice_number}`}
            onClick={() => handleDetail(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <TableToolbar
          title="Daftar Invoice"
          description={`${filteredInvoices.length} dari ${invoices.length} invoice ditampilkan.`}
          filters={
            <div className="w-full min-w-0">
              <InvoiceFilter filters={filters} onChange={handleFilterChange} />
            </div>
          }
          actions={
            <Button
              variant="primary"
              icon={<PlusOutlined />}
              onClick={() => setGenerateModalOpen(true)}
              block
              className="sm:w-auto!"
            >
              Generate Invoice
            </Button>
          }
        />

        {/* Desktop DataTable */}
        <Card className="hidden md:block">
          <DataTable<InvoiceModel>
            rowKey="id"
            columns={columns}
            dataSource={paginatedInvoices}
            pagination={false}
            scroll={{ x: 1200 }}
            emptyTitle={
              invoices.length === 0
                ? "Belum ada invoice"
                : "Invoice tidak ditemukan"
            }
            emptyDescription={
              invoices.length === 0
                ? "Generate invoice pertama untuk mulai mengelola tagihan sewa."
                : "Coba ubah kata kunci pencarian atau filter invoice."
            }
            emptyAction={
              invoices.length === 0 ? (
                <Button onClick={() => setGenerateModalOpen(true)}>
                  Generate Invoice Pertama
                </Button>
              ) : undefined
            }
          />

          {filteredInvoices.length > 0 && (
            <TablePagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredInvoices.length}
              onChange={(page, nextPageSize) => {
                setRequestedPage(page);
                setPageSize(nextPageSize);
              }}
            />
          )}
        </Card>

        {/* Mobile Invoice Cards */}
        <div className="space-y-5 md:hidden">
          {filteredInvoices.length === 0 ? (
            <Card>
              <EmptyState
                title={
                  invoices.length === 0
                    ? "Belum ada invoice"
                    : "Invoice tidak ditemukan"
                }
                description={
                  invoices.length === 0
                    ? "Generate invoice pertama untuk mulai mengelola tagihan sewa."
                    : "Coba ubah kata kunci pencarian atau filter invoice."
                }
                action={
                  invoices.length === 0 ? (
                    <Button onClick={() => setGenerateModalOpen(true)}>
                      Generate Invoice Pertama
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {paginatedInvoices.map((invoice) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onDetail={handleDetail}
                />
              ))}
            </div>
          )}

          {filteredInvoices.length > 0 && (
            <div className="pt-1">
              <TablePagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredInvoices.length}
                onChange={(page, nextPageSize) => {
                  setRequestedPage(page);
                  setPageSize(nextPageSize);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Generate Invoice */}
      <GenerateInvoiceModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
      />

      {/* Invoice Detail */}
      <InvoiceDetailModal
        open={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </>
  );
}
