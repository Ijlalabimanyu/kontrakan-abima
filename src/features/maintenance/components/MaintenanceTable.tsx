"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import type {
  MaintenanceModel,
  MaintenancePropertyOption,
  MaintenanceRoomOption,
  MaintenanceStatus,
} from "../interfaces/maintenance.interface";
import { updateMaintenanceStatus } from "@/services/maintenance/actions";

import CompleteMaintenanceModal from "./CompleteMaintenanceModal";
import MaintenanceForm from "./MaintenanceForm";

const statusConfig: Record<
  MaintenanceStatus,
  { label: string; color: string }
> = {
  OPEN: { label: "Open", color: "blue" },
  IN_PROGRESS: { label: "Dalam Proses", color: "processing" },
  COMPLETED: { label: "Selesai", color: "success" },
  CANCELLED: { label: "Dibatalkan", color: "default" },
};

const priorityConfig = {
  LOW: { label: "Rendah", color: "default" },
  MEDIUM: { label: "Sedang", color: "blue" },
  HIGH: { label: "Tinggi", color: "orange" },
  URGENT: { label: "Urgent", color: "red" },
} as const;

interface Props {
  data: MaintenanceModel[];
  properties: MaintenancePropertyOption[];
  rooms: MaintenanceRoomOption[];
}

export default function MaintenanceTable({ data, properties, rooms }: Props) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selected, setSelected] = useState<MaintenanceModel | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    MaintenanceStatus | undefined
  >();

  const filteredData = useMemo(
    () =>
      statusFilter ? data.filter((item) => item.status === statusFilter) : data,
    [data, statusFilter],
  );
  const refresh = () => router.refresh();

  const handleStatusChange = async (
    record: MaintenanceModel,
    status: "IN_PROGRESS" | "CANCELLED",
  ) => {
    const result = await updateMaintenanceStatus(record.id, status);
    if (!result.success) {
      window.alert(result.message);
      return;
    }
    refresh();
  };

  const columns: ColumnsType<MaintenanceModel> = [
    {
      title: "Laporan",
      key: "report",
      render: (_, record) => (
        <div>
          <Typography.Text strong>{record.title}</Typography.Text>
          <div className="text-xs text-slate-500">
            {record.property_name}
            {record.room_number ? ` · Kamar ${record.room_number}` : ""}
          </div>
          <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
            {record.description}
          </div>
        </div>
      ),
    },
    { title: "Kategori", dataIndex: "category", key: "category" },
    {
      title: "Prioritas",
      dataIndex: "priority",
      key: "priority",
      render: (value: keyof typeof priorityConfig) => (
        <Tag color={priorityConfig[value].color}>
          {priorityConfig[value].label}
        </Tag>
      ),
    },
    {
      title: "Tanggal Laporan",
      dataIndex: "reported_at",
      key: "reported_at",
      render: (value: string) =>
        new Date(value).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Jakarta",
        }),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: MaintenanceStatus) => (
        <Tag color={statusConfig[value].color}>{statusConfig[value].label}</Tag>
      ),
    },
    {
      title: "Biaya",
      dataIndex: "cost_amount",
      key: "cost_amount",
      align: "right",
      render: (value: number) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(value),
    },
    {
      title: "Aksi",
      key: "action",
      width: 260,
      render: (_, record) => (
        <Space wrap>
          {(record.status === "OPEN" || record.status === "IN_PROGRESS") && (
            <Button
              size="small"
              onClick={() => {
                setSelected(record);
                setFormOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {record.status === "OPEN" && (
            <>
              <Button
                size="small"
                type="primary"
                onClick={() => void handleStatusChange(record, "IN_PROGRESS")}
              >
                Mulai
              </Button>
              <Popconfirm
                title="Batalkan maintenance ini?"
                onConfirm={() => void handleStatusChange(record, "CANCELLED")}
              >
                <Button size="small" danger>
                  Batalkan
                </Button>
              </Popconfirm>
            </>
          )}
          {record.status === "IN_PROGRESS" && (
            <Button
              size="small"
              type="primary"
              onClick={() => {
                setSelected(record);
                setCompleteOpen(true);
              }}
            >
              Selesaikan
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Select
          allowClear
          placeholder="Semua status"
          className="w-48"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: "Open", value: "OPEN" },
            { label: "Dalam Proses", value: "IN_PROGRESS" },
            { label: "Selesai", value: "COMPLETED" },
            { label: "Dibatalkan", value: "CANCELLED" },
          ]}
        />
        <Button
          type="primary"
          onClick={() => {
            setSelected(null);
            setFormOpen(true);
          }}
        >
          + Buat Maintenance
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        scroll={{ x: 1100 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} maintenance`,
        }}
      />

      <MaintenanceForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={refresh}
        properties={properties}
        rooms={rooms}
        initialData={selected}
      />
      <CompleteMaintenanceModal
        open={completeOpen}
        maintenance={selected}
        onClose={() => setCompleteOpen(false)}
        onSuccess={refresh}
      />
    </>
  );
}
