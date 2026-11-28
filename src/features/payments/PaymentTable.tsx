"use client";

import { useMemo, useState } from "react";
import { Eye, Plus } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Button, Card, EmptyState } from "@/components/ui";
import { DataTable, TablePagination, TableToolbar } from "@/components/tables";

import type {
  PaymentFilterValues,
  PaymentInvoiceOption,
  PaymentMethod,
  PaymentModel,
} from "@/services/payments/interface";
import PaymentFilter from "./PaymentFilter";
import PaymentForm from "./PaymentForm";
import PaymentMethodBadge from "./PaymentMethodBadge";
import PaymentDetailModal from "./PaymentDetailModal";
import PaymentCard from "./PaymentCard";

import { CurrencyFormatter } from "@/lib/utils";

interface PaymentTableProps {
  payments: PaymentModel[];
  payableInvoices: PaymentInvoiceOption[];
}

const initialFilters: PaymentFilterValues = {
  search: "",
  payment_method: null,
  payment_date: null,
};

export default function PaymentTable({
  payments,
  payableInvoices,
}: PaymentTableProps) {
  const [filters, setFilters] = useState<PaymentFilterValues>(initialFilters);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentModel | null>(
    null,
  );

  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredPayments = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return payments.filter((payment) => {
      const searchableValues = [
        payment.payment_number,
        payment.invoice_number,
        payment.tenant_name,
        payment.tenant_phone,
        payment.room_number,
        payment.property_name,
      ];

      const matchesSearch =
        !keyword ||
        searchableValues.some((value) =>
          (value ?? "").toLowerCase().includes(keyword),
        );

      const matchesMethod =
        !filters.payment_method ||
        payment.payment_method === filters.payment_method;

      const matchesDate =
        !filters.payment_date || payment.payment_date === filters.payment_date;

      return matchesSearch && matchesMethod && matchesDate;
    });
  }, [payments, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));

  const currentPage = Math.min(requestedPage, totalPages);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredPayments.slice(startIndex, startIndex + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  const handleFilterChange = (value: PaymentFilterValues) => {
    setFilters(value);
    setRequestedPage(1);
  };

  const handlePageChange = (page: number, nextPageSize: number) => {
    setRequestedPage(page);
    setPageSize(nextPageSize);
  };

  const columns: ColumnsType<PaymentModel> = [
    {
      title: "No. Pembayaran",
      dataIndex: "payment_number",
      key: "payment_number",
      render: (value: string) => (
        <span className="font-medium text-primary">{value}</span>
      ),
    },
    {
      title: "No. Invoice",
      dataIndex: "invoice_number",
      key: "invoice_number",
    },
    {
      title: "Penyewa",
      dataIndex: "tenant_name",
      key: "tenant_name",
    },
    {
      title: "Properti / Kamar",
      key: "room",
      render: (_, record) => (
        <div>
          <p className="font-medium text-foreground">{record.property_name}</p>
          <p className="text-xs text-muted">Kamar {record.room_number}</p>
        </div>
      ),
    },
    {
      title: "Tanggal Pembayaran",
      dataIndex: "payment_date",
      key: "payment_date",
      render: (value: string) => dayjs(value).format("DD MMM YYYY"),
    },
    {
      title: "Metode",
      dataIndex: "payment_method",
      key: "payment_method",
      render: (value: PaymentMethod) => <PaymentMethodBadge method={value} />,
    },
    {
      title: "Nominal",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value: number) => (
        <span className="font-medium text-foreground">
          {CurrencyFormatter.format(value)}
        </span>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button variant="ghost" onClick={() => setSelectedPayment(record)}>
          <Eye size={16} />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TableToolbar
        title="Daftar Pembayaran"
        description={`${filteredPayments.length} dari ${payments.length} pembayaran ditampilkan.`}
        filters={
          <PaymentFilter filters={filters} onChange={handleFilterChange} />
        }
        actions={
          <Button
            variant="primary"
            onClick={() => setFormOpen(true)}
            disabled={!payableInvoices.length}
            block
            className="sm:w-auto!"
          >
            <Plus size={17} />
            Catat Pembayaran
          </Button>
        }
      />

      {/* Desktop */}
      <Card className="hidden md:block">
        <DataTable
          rowKey="id"
          columns={columns}
          dataSource={paginatedPayments}
          pagination={false}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: "Belum ada transaksi pembayaran",
          }}
        />

        {filteredPayments.length > 0 && (
          <TablePagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredPayments.length}
            onChange={handlePageChange}
          />
        )}
      </Card>

      {/* Mobile */}
      <div className="space-y-5 md:hidden">
        {paginatedPayments.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              {paginatedPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onDetail={setSelectedPayment}
                />
              ))}
            </div>

            {filteredPayments.length > 0 && (
              <div className="pt-1">
                <TablePagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={filteredPayments.length}
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <Card>
            <EmptyState
              title="Belum ada pembayaran"
              description="Transaksi pembayaran yang sesuai dengan pencarian atau filter belum tersedia."
            />
          </Card>
        )}
      </div>

      {/* Modals */}
      <PaymentForm
        open={formOpen}
        invoices={payableInvoices}
        onClose={() => setFormOpen(false)}
      />

      <PaymentDetailModal
        open={!!selectedPayment}
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
      />
    </div>
  );
}
