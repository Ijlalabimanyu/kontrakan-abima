"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Popconfirm,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
  ContractFilterValues,
  ContractModel,
  ContractRoomOption,
  ContractTenantOption,
} from "@/services/contract/interface";
import ContractForm from "./ContractForm";
import ContractFilter from "./ContractFilter";
import ContractStatusBadge from "./ContractStatusBadge";
import ContractDetailModal from "./ContractDetailModal";
import {
  cancelContract,
  completeContract,
} from "@/services/contract/actions";

interface ContractTableProps {
  contracts: ContractModel[];
  rooms: ContractRoomOption[];
  tenants: ContractTenantOption[];
}

const initialFilters: ContractFilterValues = {
  search: "",
  status: null,
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function ContractTable({
  contracts,
  rooms,
  tenants,
}: ContractTableProps) {
  const router = useRouter();

  const [filters, setFilters] = useState(initialFilters);
  const [selectedContract, setSelectedContract] =
    useState<ContractModel | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = message.useMessage();

  const filteredContracts = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return contracts.filter((contract) => {
      const matchesSearch =
        !keyword ||
        contract.tenant_name.toLowerCase().includes(keyword) ||
        contract.room_number.toLowerCase().includes(keyword) ||
        contract.property_name.toLowerCase().includes(keyword);
      const matchesStatus =
        !filters.status || contract.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [contracts, filters]);

  const handleAdd = () => {
    setSelectedContract(null);
    setFormOpen(true);
  };

  const handleEdit = (contract: ContractModel) => {
    setSelectedContract(contract);
    setFormOpen(true);
  };

  const handleDetail = (contract: ContractModel) => {
    setSelectedContract(contract);
    setDetailOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setSelectedContract(null);
    router.refresh();
  };

  const handleStatusChange = (
    contractId: string,
    action: "COMPLETE" | "CANCEL",
  ) => {
    startTransition(async () => {
      try {
        const result =
          action === "COMPLETE"
            ? await completeContract(contractId)
            : await cancelContract(contractId);

        if (!result.success) {
          messageApi.error(result.message);
          return;
        }

        messageApi.success(result.message);
        router.refresh();
      } catch {
        messageApi.error("Terjadi kesalahan saat memperbarui kontrak");
      }
    });
  };

  const columns: ColumnsType<ContractModel> = [
    {
      title: "No.",
      key: "index",
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Penyewa",
      dataIndex: "tenant_name",
      key: "tenant_name",
      render: (value: string) => (
        <Typography.Text strong>{value}</Typography.Text>
      ),
    },
    {
      title: "Properti",
      dataIndex: "property_name",
      key: "property_name",
    },
    {
      title: "Kamar",
      dataIndex: "room_number",
      key: "room_number",
    },
    {
      title: "Mulai Sewa",
      dataIndex: "start_date",
      key: "start_date",
      render: (value: string) => dayjs(value).format("DD/MM/YYYY"),
    },
    {
      title: "Harga / Bulan",
      dataIndex: "monthly_price",
      key: "monthly_price",
      render: (value: number) => currencyFormatter.format(value),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: ContractModel["status"]) => (
        <ContractStatusBadge status={status} />
      ),
    },
    {
      title: "Aksi",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            title="Detail"
            onClick={() => handleDetail(record)}
          />

          {record.status === "ACTIVE" && (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                title="Edit"
                onClick={() => handleEdit(record)}
              />

              <Popconfirm
                title="Selesaikan kontrak"
                description="Apakah kamu yakin ingin menyelesaikan kontrak ini?"
                okText="Ya, selesaikan"
                cancelText="Batal"
                onConfirm={() => handleStatusChange(record.id, "COMPLETE")}
              >
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  title="Selesaikan kontrak"
                  disabled={isPending}
                />
              </Popconfirm>

              <Popconfirm
                title="Batalkan kontrak"
                description="Apakah kamu yakin ingin membatalkan kontrak ini?"
                okText="Ya, batalkan"
                cancelText="Batal"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleStatusChange(record.id, "CANCEL")}
              >
                <Button
                  type="text"
                  danger
                  icon={<CloseCircleOutlined />}
                  title="Batalkan kontrak"
                  disabled={isPending}
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <Card>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <Typography.Title level={5} className="!mb-1">
              Daftar Kontrak Sewa
            </Typography.Title>

            <Typography.Text type="secondary">
              Total {contracts.length} kontrak
            </Typography.Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            disabled={
              rooms.every(
                (room) =>
                  room.status === "MAINTENANCE" || room.hasActiveContract,
              ) || tenants.length === 0
            }
          >
            Buat Kontrak
          </Button>
        </div>

        <ContractFilter filters={filters} onChange={setFilters} />

        <div className="mt-4">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredContracts}
            scroll={{ x: 1100 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} kontrak`,
            }}
            locale={{
              emptyText: "Belum ada data kontrak",
            }}
          />
        </div>
      </Card>

      <ContractForm
        open={formOpen}
        contract={selectedContract}
        rooms={rooms}
        tenants={tenants}
        onClose={() => {
          setFormOpen(false);
          setSelectedContract(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <ContractDetailModal
        open={detailOpen}
        contract={selectedContract}
        onClose={() => {
          setDetailOpen(false);
          setSelectedContract(null);
        }}
      />
    </>
  );
}
