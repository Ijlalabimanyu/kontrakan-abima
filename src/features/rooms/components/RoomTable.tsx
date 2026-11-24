"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { PropertyModel } from "@/features/properties/interfaces/property.interface";
import { deleteRoom } from "@/services/rooms/actions";
import RoomFilter from "./RoomFilter";
import RoomForm from "./RoomForm";
import RoomStatusBadge from "./RoomStatusBadge";
import { RoomFilterValues, RoomModel } from "../interfaces/room.interfaces";

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

  const [filters, setFilters] = useState(initialFilters);
  const [selectedRoom, setSelectedRoom] = useState<RoomModel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch = room.room_number
        .toLowerCase()
        .includes(filters.search.toLowerCase().trim());

      const matchesProperty =
        !filters.property_id || room.property_id === filters.property_id;

      const matchesStatus = !filters.status || room.status === filters.status;

      return matchesSearch && matchesProperty && matchesStatus;
    });
  }, [rooms, filters]);

  const handleAdd = () => {
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

  const handleDelete = async (roomId: string) => {
    setIsDeleting(roomId);

    try {
      const result = await deleteRoom(roomId);

      if (!result.success) {
        messageApi.error(result.message);
        return;
      }

      messageApi.success(result.message);
      router.refresh();
    } catch {
      messageApi.error("Terjadi kesalahan saat menghapus kamar");
    } finally {
      setIsDeleting(null);
    }
  };

  const columns: ColumnsType<RoomModel> = [
    {
      title: "No.",
      key: "index",
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nomor Kamar",
      dataIndex: "room_number",
      key: "room_number",
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
      title: "Harga Sewa / Bulan",
      dataIndex: "monthly_price",
      key: "monthly_price",
      render: (value: number) => currencyFormatter.format(value),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: RoomModel["status"]) => (
        <RoomStatusBadge status={status} />
      ),
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (value: string | null) => value || "-",
    },
    {
      title: "Aksi",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit kamar"
          />

          <Popconfirm
            title="Hapus kamar"
            description={`Apakah kamu yakin ingin menghapus kamar ${record.room_number}?`}
            okText="Ya, hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true, loading: isDeleting === record.id }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting === record.id}
              title="Hapus kamar"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <div className="space-y-4">
        <Card>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <Typography.Title level={5} className="!mb-1">
                Daftar Kamar
              </Typography.Title>

              <Typography.Text type="secondary">
                Total {rooms.length} kamar terdaftar
              </Typography.Text>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={properties.length === 0}
            >
              Tambah Kamar
            </Button>
          </div>

          <RoomFilter
            properties={properties}
            filters={filters}
            onChange={setFilters}
          />

          {properties.length === 0 && (
            <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
              Belum ada properti. Tambahkan properti terlebih dahulu sebelum
              membuat kamar.
            </div>
          )}

          <div className="mt-4">
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filteredRooms}
              scroll={{ x: 1000 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} kamar`,
              }}
              locale={{
                emptyText: (
                  <div className="py-8">
                    <HomeOutlined className="mb-2 text-3xl text-slate-300" />
                    <p className="text-slate-500">
                      {rooms.length === 0
                        ? "Belum ada kamar"
                        : "Kamar tidak ditemukan"}
                    </p>
                  </div>
                ),
              }}
            />
          </div>
        </Card>
      </div>

      <RoomForm
        open={modalOpen}
        room={selectedRoom}
        properties={properties}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </>
  );
}
