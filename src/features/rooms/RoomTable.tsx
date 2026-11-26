"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
} from "@/components/ui";
import { DataTable, TablePagination, TableToolbar } from "@/components/tables";
import type { PropertyModel } from "@/services/properties/interface";
import { deleteRoom } from "@/services/rooms/actions";
import type { RoomFilterValues, RoomModel } from "@/services/rooms/interfaces";
import RoomFilter from "./RoomFilter";
import RoomForm from "./RoomForm";
import RoomStatusBadge from "./RoomStatusBadge";
import RoomCard from "./RoomCard";

interface RoomTableProps {
  rooms: RoomModel[];
  properties: PropertyModel[];
}

const initialFilters: RoomFilterValues = {
  search: "",
  property_id: null,
  status: null,
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function RoomTable({ rooms, properties }: RoomTableProps) {
  const router = useRouter();

  const [messageApi, contextHolder] = message.useMessage();

  // Filters
  const [filters, setFilters] = useState(initialFilters);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form
  const [selectedRoom, setSelectedRoom] = useState<RoomModel | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<RoomModel | null>(null);

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // -----------------------------------------
  // Filtering
  // -----------------------------------------

  const filteredRooms = useMemo(() => {
    const search = filters.search.trim().toLocaleLowerCase("id-ID");

    return rooms.filter((room) => {
      const matchesSearch = room.room_number
        .toLocaleLowerCase("id-ID")
        .includes(search);

      const matchesProperty =
        !filters.property_id || room.property_id === filters.property_id;

      const matchesStatus = !filters.status || room.status === filters.status;

      return matchesSearch && matchesProperty && matchesStatus;
    });
  }, [rooms, filters]);

  const handleFilterChange = (nextFilters: RoomFilterValues) => {
    setFilters(nextFilters);
    setCurrentPage(1);
  };

  // -----------------------------------------
  // Pagination
  // -----------------------------------------

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / pageSize));

  const effectiveCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRooms = useMemo(() => {
    const startIndex = (effectiveCurrentPage - 1) * pageSize;

    return filteredRooms.slice(startIndex, startIndex + pageSize);
  }, [filteredRooms, effectiveCurrentPage, pageSize]);

  // -----------------------------------------
  // Room Statistics
  // -----------------------------------------

  const roomStats = useMemo(
    () => [
      {
        label: "Total Kamar",
        value: rooms.length,
        tone: "neutral" as const,
      },
      {
        label: "Tersedia",
        value: rooms.filter((room) => room.status === "AVAILABLE").length,
        tone: "success" as const,
      },
      {
        label: "Terisi",
        value: rooms.filter((room) => room.status === "OCCUPIED").length,
        tone: "brand" as const,
      },
      {
        label: "Maintenance",
        value: rooms.filter((room) => room.status === "MAINTENANCE").length,
        tone: "warning" as const,
      },
    ],
    [rooms],
  );

  // -----------------------------------------
  // Add & Edit
  // -----------------------------------------

  const handleAdd = () => {
    if (properties.length === 0) return;

    setSelectedRoom(null);
    setModalOpen(true);
  };

  const handleEdit = (room: RoomModel) => {
    setSelectedRoom(room);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedRoom(null);
  };

  const handleSuccess = () => {
    handleClose();
    router.refresh();
  };

  // -----------------------------------------
  // Delete
  // -----------------------------------------

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    const roomId = deleteTarget.id;

    setIsDeleting(roomId);

    try {
      const result = await deleteRoom(roomId);

      if (!result.success) {
        messageApi.error(result.message);
        return;
      }

      messageApi.success(result.message);

      setDeleteTarget(null);
      router.refresh();
    } catch {
      messageApi.error("Terjadi kesalahan saat menghapus kamar.");
    } finally {
      setIsDeleting(null);
    }
  };

  // -----------------------------------------
  // Table Columns
  // -----------------------------------------

  const columns: ColumnsType<RoomModel> = [
    {
      title: "No.",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        (effectiveCurrentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Nomor Kamar",
      dataIndex: "room_number",
      key: "room_number",
      width: 140,
      render: (value: string) => (
        <span className="font-semibold text-foreground">{value}</span>
      ),
    },
    {
      title: "Properti",
      dataIndex: "property_name",
      key: "property_name",
      width: 200,
    },
    {
      title: "Harga Sewa / Bulan",
      dataIndex: "monthly_price",
      key: "monthly_price",
      width: 180,
      render: (value: number) => (
        <span className="font-medium text-foreground">
          {currencyFormatter.format(value)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: RoomModel["status"]) => (
        <RoomStatusBadge status={status} />
      ),
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (value: string | null) => (
        <span className="text-muted">{value || "-"}</span>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      fixed: "right",
      width: 110,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="small"
            icon={<EditOutlined />}
            aria-label={`Edit kamar ${record.room_number}`}
            disabled={isDeleting !== null}
            onClick={() => handleEdit(record)}
          />

          <Button
            variant="ghost"
            size="small"
            icon={<DeleteOutlined />}
            className="!text-danger hover:!bg-danger-soft"
            aria-label={`Hapus kamar ${record.room_number}`}
            disabled={isDeleting !== null}
            onClick={() => setDeleteTarget(record)}
          />
        </div>
      ),
    },
  ];

  const isDeleteLoading = isDeleting !== null;

  return (
    <>
      {contextHolder}

      <div className="space-y-6">
        {/* Room Statistics */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {roomStats.map((stat) => (
            <Card key={stat.label}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted sm:text-sm">
                  {stat.label}
                </p>

                <Badge tone={stat.tone}>{stat.value}</Badge>
              </div>

              <p className="mt-3 text-2xl font-bold text-foreground">
                {stat.value}
              </p>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <TableToolbar
          title="Daftar Kamar"
          description={`${filteredRooms.length} dari ${rooms.length} kamar ditampilkan.`}
          filters={
            <RoomFilter
              properties={properties}
              filters={filters}
              onChange={handleFilterChange}
            />
          }
          actions={
            <Button
              variant="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={properties.length === 0 || isDeleteLoading}
              block
              className="sm:!w-auto"
            >
              Tambah Kamar
            </Button>
          }
        />

        {/* Property Warning */}
        {properties.length === 0 && (
          <div className="rounded-lg border border-warning/30 bg-warning-soft p-4">
            <p className="text-sm font-semibold text-warning">
              Belum ada properti
            </p>

            <p className="mt-1 text-xs leading-5 text-muted">
              Tambahkan properti terlebih dahulu sebelum membuat kamar.
            </p>
          </div>
        )}

        {/* Desktop DataTable */}
        <Card className="hidden md:block">
          <DataTable<RoomModel>
            rowKey="id"
            columns={columns}
            dataSource={paginatedRooms}
            loading={isDeleteLoading}
            pagination={false}
            scroll={{ x: 1000 }}
            emptyTitle={
              rooms.length === 0 ? "Belum ada kamar" : "Kamar tidak ditemukan"
            }
            emptyDescription={
              rooms.length === 0
                ? "Tambahkan kamar pertama untuk mulai mengelola unit properti."
                : "Coba ubah pencarian atau filter kamar."
            }
            emptyAction={
              rooms.length === 0 && properties.length > 0 ? (
                <Button onClick={handleAdd}>Tambah Kamar Pertama</Button>
              ) : undefined
            }
          />

          {filteredRooms.length > 0 && (
            <TablePagination
              current={effectiveCurrentPage}
              pageSize={pageSize}
              total={filteredRooms.length}
              onChange={(page, nextPageSize) => {
                setCurrentPage(page);
                setPageSize(nextPageSize);
              }}
            />
          )}
        </Card>

        {/* Mobile Room Cards */}
        <div className="space-y-5 md:hidden">
          {filteredRooms.length === 0 ? (
            <Card>
              <EmptyState
                title={
                  rooms.length === 0
                    ? "Belum ada kamar"
                    : "Kamar tidak ditemukan"
                }
                description={
                  rooms.length === 0
                    ? "Tambahkan kamar pertama untuk mulai mengelola unit properti."
                    : "Coba ubah pencarian atau filter kamar."
                }
                action={
                  rooms.length === 0 && properties.length > 0 ? (
                    <Button onClick={handleAdd}>Tambah Kamar Pertama</Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {paginatedRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  disabled={isDeleteLoading}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}

          {filteredRooms.length > 0 && (
            <div className="pt-1">
              <TablePagination
                current={effectiveCurrentPage}
                pageSize={pageSize}
                total={filteredRooms.length}
                onChange={(page, nextPageSize) => {
                  setCurrentPage(page);
                  setPageSize(nextPageSize);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Existing Room Form */}
      <RoomForm
        open={modalOpen}
        room={selectedRoom}
        properties={properties}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Kamar?"
        description={
          <>
            Apakah kamu yakin ingin menghapus kamar{" "}
            <strong>{deleteTarget?.room_number}</strong>? Tindakan ini tidak
            dapat dibatalkan.
          </>
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmVariant="danger"
        confirmLoading={isDeleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleteLoading) {
            setDeleteTarget(null);
          }
        }}
      />
    </>
  );
}
