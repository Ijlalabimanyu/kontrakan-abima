"use client";

import { Card, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";

import type { ReportExpenseModel } from "../interfaces/report.interface";

interface ExpenseReportTableProps {
  data: ReportExpenseModel[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const categoryLabels: Record<string, string> = {
  ELECTRICITY: "Listrik",
  WATER: "Air",
  INTERNET: "Internet / WiFi",
  MAINTENANCE: "Maintenance",
  CLEANING: "Kebersihan",
  SUPPLIES: "Perlengkapan",
  TAX: "Pajak",
  OTHER: "Lainnya",
};
const methodLabels: Record<string, string> = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
};

export default function ExpenseReportTable({ data }: ExpenseReportTableProps) {
  const columns: TableColumnsType<ReportExpenseModel> = [
    {
      title: "No. Pengeluaran",
      dataIndex: "expense_number",
      key: "expense_number",
      width: 190,
    },
    {
      title: "Tanggal",
      dataIndex: "expense_date",
      key: "expense_date",
      width: 140,
      sorter: (a, b) => a.expense_date.localeCompare(b.expense_date),
      render: (value: string) => dayjs(value).format("DD MMM YYYY"),
    },
    {
      title: "Kategori",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (value: string) => (
        <Tag color="orange">{categoryLabels[value] ?? value}</Tag>
      ),
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      width: 240,
    },
    {
      title: "Metode",
      dataIndex: "payment_method",
      key: "payment_method",
      width: 120,
      render: (value: string) => methodLabels[value] ?? value,
    },
    {
      title: "Nominal",
      dataIndex: "amount",
      key: "amount",
      width: 160,
      align: "right",
      sorter: (a, b) => a.amount - b.amount,
      render: (value: number) => (
        <span className="font-semibold text-red-500">
          {formatCurrency(value)}
        </span>
      ),
    },
  ];

  return (
    <Card title="Detail Pengeluaran">
      <Table<ReportExpenseModel>
        rowKey="id"
        columns={columns}
        dataSource={data}
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} transaksi`,
        }}
        locale={{ emptyText: "Tidak ada transaksi pengeluaran" }}
      />
    </Card>
  );
}
