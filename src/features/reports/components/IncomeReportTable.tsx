"use client";

import { Card, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";

import type { ReportPaymentModel } from "../interfaces/report.interface";

interface IncomeReportTableProps {
  data: ReportPaymentModel[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const methodLabels: Record<string, string> = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
};

export default function IncomeReportTable({ data }: IncomeReportTableProps) {
  const columns: TableColumnsType<ReportPaymentModel> = [
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
      render: (value: string) => (
        <Tag
          color={
            value === "CASH" ? "green" : value === "QRIS" ? "purple" : "blue"
          }
        >
          {methodLabels[value] ?? value}
        </Tag>
      ),
    },
    {
      title: "Nominal",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 160,
      sorter: (a, b) => a.amount - b.amount,
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value)}
        </span>
      ),
    },
  ];

  return (
    <Card title="Detail Pemasukan">
      <Table<ReportPaymentModel>
        rowKey="id"
        columns={columns}
        dataSource={data}
        scroll={{ x: 1100 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} transaksi`,
        }}
        locale={{ emptyText: "Tidak ada transaksi pemasukan" }}
      />
    </Card>
  );
}
