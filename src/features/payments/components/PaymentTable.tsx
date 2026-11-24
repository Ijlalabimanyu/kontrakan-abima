"use client";

import { useMemo, useState } from "react";
import { Button, Empty, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import {
  PaymentFilterValues,
  PaymentInvoiceOption,
  PaymentMethod,
  PaymentModel,
} from "../interfaces/payment.interface";
import PaymentFilter from "./PaymentFilter";
import PaymentForm from "./PaymentForm";
import PaymentMethodBadge from "./PaymentMethodBadge";
import PaymentDetailModal from "./PaymentDetailModal";

interface PaymentTableProps {
  payments: PaymentModel[];
  payableInvoices: PaymentInvoiceOption[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function PaymentTable({
  payments,
  payableInvoices,
}: PaymentTableProps) {
  const [filters, setFilters] = useState<PaymentFilterValues>({
    search: "",
    payment_method: null,
    payment_date: null,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentModel | null>(null);

  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) => {
        const keyword = filters.search.trim().toLowerCase();
        const matchesSearch =
          !keyword ||
          [
            payment.payment_number,
            payment.invoice_number,
            payment.tenant_name,
            payment.tenant_phone,
            payment.room_number,
            payment.property_name,
          ].some((value) => value.toLowerCase().includes(keyword));
        const matchesMethod =
          !filters.payment_method ||
          payment.payment_method === filters.payment_method;
        const matchesDate =
          !filters.payment_date ||
          payment.payment_date === filters.payment_date;

        return matchesSearch && matchesMethod && matchesDate;
      }),
    [payments, filters],
  );

  const columns: ColumnsType<PaymentModel> = [
    {
      title: "No. Pembayaran",
      dataIndex: "payment_number",
      key: "payment_number",
      render: (value: string) => (
        <span className="font-medium">{value}</span>
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
          <div>{record.property_name}</div>
          <Typography.Text type="secondary">
            {record.room_number}
          </Typography.Text>
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
        <span className="font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => setSelectedPayment(record)}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Manajemen Pembayaran</h1>
          <p className="text-sm text-slate-500">
            Kelola transaksi pembayaran sewa kontrakan.
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          disabled={!payableInvoices.length}
          onClick={() => setFormOpen(true)}
        >
          Catat Pembayaran
        </Button>
      </div>

      <PaymentFilter
        search={filters.search}
        paymentMethod={filters.payment_method}
        paymentDate={filters.payment_date}
        onSearchChange={(value) =>
          setFilters((previous) => ({ ...previous, search: value }))
        }
        onMethodChange={(value) =>
          setFilters((previous) => ({ ...previous, payment_method: value }))
        }
        onDateChange={(value) =>
          setFilters((previous) => ({ ...previous, payment_date: value }))
        }
      />

      <Table<PaymentModel>
        rowKey="id"
        columns={columns}
        dataSource={filteredPayments}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} pembayaran`,
        }}
        locale={{
          emptyText: <Empty description="Belum ada transaksi pembayaran" />,
        }}
      />

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
