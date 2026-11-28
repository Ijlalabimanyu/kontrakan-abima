"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { message, Popconfirm, Space } from "antd";
import { Plus, Eye, Pencil, CheckCircle2, XCircle } from "lucide-react";
import { Button, Card, EmptyState } from "@/components/ui";
import type { ColumnsType } from "antd/es/table";
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
import ContractCard from "./ContractCard";
import { cancelContract, completeContract } from "@/services/contract/actions";
import { DataTable, TablePagination, TableToolbar } from "@/components/tables";
import { CurrencyFormatter } from "@/lib/utils";

interface ContractTableProps {
  contracts: ContractModel[];
  rooms: ContractRoomOption[];
  tenants: ContractTenantOption[];
}

const initialFilters: ContractFilterValues = {
  search: "",
  status: null,
};

export default function ContractTable({
  contracts,
  rooms,
  tenants,
}: ContractTableProps) {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState(initialFilters);
  const [selectedContract, setSelectedContract] =
    useState<ContractModel | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [requestedPage, setRequestedPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredContracts.length / pageSize),
  );
  const currentPage = Math.min(requestedPage, totalPages);
  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredContracts.slice(startIndex, startIndex + pageSize);
  }, [filteredContracts, currentPage, pageSize]);

  const canCreateContract =
    rooms.some(
      (room) => room.status === "AVAILABLE" && !room.hasActiveContract,
    ) && tenants.length > 0;

  const handleFilterChange = (value: ContractFilterValues) => {
    setFilters(value);
    setRequestedPage(1);
  };

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

        router.refresh();
      } catch {
        messageApi.error("Gagal memperbarui kontrak");
      }
    });
  };

  const columns: ColumnsType<ContractModel> = [
    {
      title: "No.",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Penyewa",
      dataIndex: "tenant_name",
      key: "tenant_name",
      render: (value: string) => (
        <span className="font-medium text-[#202C26]">{value}</span>
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
      render: (value: number) => CurrencyFormatter.format(value),
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
      width: 240,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            variant="ghost"
            onClick={() => handleDetail(record)}
          >
            <Eye size={16} />
          </Button>

          {record.status === "ACTIVE" && (
            <>
              <Button
                size="small"
                variant="ghost"
                onClick={() => handleEdit(record)}
              >
                <Pencil size={16} />
              </Button>

              <Popconfirm
                title="Selesaikan kontrak"
                description="Apakah kamu yakin ingin menyelesaikan kontrak ini?"
                okText="Ya, selesaikan"
                cancelText="Batal"
                onConfirm={() => handleStatusChange(record.id, "COMPLETE")}
              >
                <Button size="small" variant="ghost" disabled={isPending}>
                  <CheckCircle2 size={16} />
                </Button>
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
                  variant="ghost"
                  size="small"
                  disabled={isPending}
                  className="text-danger! hover:bg-danger-soft!"
                >
                  <XCircle size={16} />
                </Button>
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

      <div className="space-y-4">
        {/* Toolbar */}
        <TableToolbar
          title="Daftar Kontrak Sewa"
          description={`${filteredContracts.length} dari ${contracts.length} kontrak ditampilkan.`}
          filters={
            <div className="w-full min-w-0 sm:w-fit">
              <ContractFilter filters={filters} onChange={handleFilterChange} />
            </div>
          }
          actions={
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={!canCreateContract}
              block
              className="sm:w-auto!"
              icon={<Plus size={17} />}
            >
              Buat Kontrak
            </Button>
          }
        />

        {/* Desktop Table */}
        <Card className="hidden md:block">
          <DataTable
            rowKey="id"
            columns={columns}
            dataSource={paginatedContracts}
            pagination={false}
            scroll={{ x: 1300 }}
            loading={isPending}
            locale={{
              emptyText: "Belum ada data kontrak",
            }}
          />

          {filteredContracts.length > 0 && (
            <TablePagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredContracts.length}
              onChange={(page, nextPageSize) => {
                setRequestedPage(page);
                setPageSize(nextPageSize);
              }}
            />
          )}
        </Card>

        {/* Mobile Contract Cards */}
        <div className="space-y-5 md:hidden">
          {filteredContracts.length === 0 ? (
            <Card>
              <EmptyState
                title="Belum ada data kontrak"
                description="Buat kontrak sewa pertama untuk mulai mengelola masa sewa dan penyewa."
                action={
                  canCreateContract ? (
                    <Button onClick={handleAdd}>Buat Kontrak Pertama</Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {paginatedContracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onDetail={handleDetail}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChange}
                  isPending={isPending}
                />
              ))}
            </div>
          )}

          {filteredContracts.length > 0 && (
            <div className="pt-1">
              <TablePagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredContracts.length}
                onChange={(page, nextPageSize) => {
                  setRequestedPage(page);
                  setPageSize(nextPageSize);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit */}
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

      {/* Detail */}
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
