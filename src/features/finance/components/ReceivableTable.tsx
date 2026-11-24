"use client";

import { useMemo, useState } from "react";
import { Card, Input, Select, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";

import type {
  ReceivableAging,
  ReceivableModel,
  ReceivableStatus,
} from "../interfaces/finance.interface";

interface ReceivableTableProps {
  data: ReceivableModel[];
}

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
  OVER_60: "> 60 Hari",
};

const agingColors: Record<ReceivableAging, string> = {
  NOT_DUE: "success",
  "1_30": "warning",
  "31_60": "orange",
  OVER_60: "error",
};

export default function ReceivableTable({ data }: ReceivableTableProps) {
  const [search, setSearch] = useState("");
  const [billingPeriod, setBillingPeriod] = useState<string | null>(null);
  const [status, setStatus] = useState<ReceivableStatus | null>(null);
  const [aging, setAging] = useState<ReceivableAging | null>(null);

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
    const keyword = search.trim().toLowerCase();

    return data.filter((item) => {
      const matchSearch =
        !keyword ||
        item.invoice_number.toLowerCase().includes(keyword) ||
        item.tenant_name.toLowerCase().includes(keyword) ||
        item.room_number.toLowerCase().includes(keyword) ||
        (item.property_name ?? "").toLowerCase().includes(keyword);

      const matchPeriod =
        !billingPeriod || item.billing_period.slice(0, 7) === billingPeriod;
      const matchStatus =
        !status || item.receivable_status === status;
      const matchAging = !aging || item.aging === aging;

      return matchSearch && matchPeriod && matchStatus && matchAging;
    });
  }, [data, search, billingPeriod, status, aging]);

  const columns: TableColumnsType<ReceivableModel> = [
    {
      title: "No. Invoice",
      dataIndex: "invoice_number",
      key: "invoice_number",
      width: 170,
      fixed: "left",
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
      width: 130,
      render: (value: string) =>
        dayjs(`${value.slice(0, 7)}-01`).format("MMMM YYYY"),
    },
    {
      title: "Jatuh Tempo",
      dataIndex: "due_date",
      key: "due_date",
      width: 130,
      sorter: (a, b) => a.due_date.localeCompare(b.due_date),
      render: (value: string) => dayjs(value).format("DD MMM YYYY"),
    },
    {
      title: "Total Tagihan",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 150,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Sudah Dibayar",
      dataIndex: "paid_amount",
      key: "paid_amount",
      align: "right",
      width: 150,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "Sisa Piutang",
      dataIndex: "remaining_amount",
      key: "remaining_amount",
      align: "right",
      width: 150,
      sorter: (a, b) => a.remaining_amount - b.remaining_amount,
      render: (value: number) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 160,
      render: (_, record) => (
        <Tag
          color={
            record.receivable_status === "OVERDUE" ? "error" : "success"
          }
        >
          {record.receivable_status === "OVERDUE"
            ? `Terlambat ${record.days_overdue} Hari`
            : "Belum Jatuh Tempo"}
        </Tag>
      ),
    },
    {
      title: "Aging",
      dataIndex: "aging",
      key: "aging",
      width: 160,
      render: (value: ReceivableAging) => (
        <Tag color={agingColors[value]}>{agingLabels[value]}</Tag>
      ),
    },
  ];

  return (
    <Card title="Daftar Piutang">
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          allowClear
          placeholder="Cari invoice, penyewa, atau kamar"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full md:max-w-xs"
        />

        <Select<string>
          allowClear
          placeholder="Periode tagihan"
          options={periodOptions}
          value={billingPeriod}
          onChange={(value) => setBillingPeriod(value ?? null)}
          className="w-full md:w-48"
        />

        <Select<ReceivableStatus>
          allowClear
          placeholder="Status"
          value={status}
          onChange={(value) => setStatus(value ?? null)}
          className="w-full md:w-48"
          options={[
            { label: "Belum Jatuh Tempo", value: "NOT_DUE" },
            { label: "Terlambat", value: "OVERDUE" },
          ]}
        />

        <Select<ReceivableAging>
          allowClear
          placeholder="Aging"
          value={aging}
          onChange={(value) => setAging(value ?? null)}
          className="w-full md:w-48"
          options={[
            { label: "Belum Jatuh Tempo", value: "NOT_DUE" },
            { label: "1–30 Hari", value: "1_30" },
            { label: "31–60 Hari", value: "31_60" },
            { label: "Lebih dari 60 Hari", value: "OVER_60" },
          ]}
        />
      </div>

      <Table<ReceivableModel>
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        scroll={{ x: 1500 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} piutang`,
        }}
        locale={{
          emptyText: "Tidak ada data piutang",
        }}
      />
    </Card>
  );
}
