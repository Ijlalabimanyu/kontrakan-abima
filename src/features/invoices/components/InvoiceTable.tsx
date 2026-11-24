"use client";

import { useMemo, useState } from "react";
import { Button, Empty, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import {
  InvoiceDisplayStatus,
  InvoiceFilterValues,
  InvoiceModel,
} from "../interfaces/invoice.interface";
import InvoiceDetailModal from "./InvoiceDetailModal";
import InvoiceFilter from "./InvoiceFilter";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import GenerateInvoiceModal from "./GenerateInvoiceModal";

interface InvoiceTableProps {
  invoices: InvoiceModel[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  const [filters, setFilters] = useState<InvoiceFilterValues>({
    search: "",
    status: null,
    billing_period: null,
  });
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceModel | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const keyword = filters.search.trim().toLowerCase();
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

  const columns: ColumnsType<InvoiceModel> = [
    {
      title: "No. Invoice",
      dataIndex: "invoice_number",
      key: "invoice_number",
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      ),
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
      title: "Periode",
      dataIndex: "billing_period",
      key: "billing_period",
      render: (value: string) => dayjs(value).format("MMMM YYYY"),
    },
    {
      title: "Jatuh Tempo",
      dataIndex: "due_date",
      key: "due_date",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY"),
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
      title: "Status",
      dataIndex: "display_status",
      key: "display_status",
      render: (value: InvoiceDisplayStatus) => (
        <InvoiceStatusBadge status={value} />
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
          onClick={() => setSelectedInvoice(record)}
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
          <h1 className="text-2xl font-semibold">Manajemen Invoice</h1>
          <p className="text-sm text-slate-500">
            Kelola tagihan sewa kontrakan.
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setGenerateModalOpen(true)}
        >
          Generate Invoice
        </Button>
      </div>

      <InvoiceFilter
        search={filters.search}
        status={filters.status}
        billingPeriod={filters.billing_period}
        onSearchChange={(value) =>
          setFilters((previous) => ({ ...previous, search: value }))
        }
        onStatusChange={(value) =>
          setFilters((previous) => ({ ...previous, status: value }))
        }
        onPeriodChange={(value) =>
          setFilters((previous) => ({ ...previous, billing_period: value }))
        }
      />

      <Table<InvoiceModel>
        rowKey="id"
        columns={columns}
        dataSource={filteredInvoices}
        scroll={{ x: 1100 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} invoice`,
        }}
        locale={{
          emptyText: <Empty description="Belum ada invoice" />,
        }}
      />

      <GenerateInvoiceModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
      />

      <InvoiceDetailModal
        open={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
