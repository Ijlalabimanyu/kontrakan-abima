"use client";

import { useState } from "react";
import {
  Button,
  Empty,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import {
  PropertyModel,
  PropertyFormValues,
} from "../interfaces/property.interface";
import PropertyForm from "./PropertyForm";
import {
  createPropertyAction,
  deletePropertyAction,
  updatePropertyAction,
} from "@/services/properties/actions";
import { useRouter } from "next/navigation";

const { Text } = Typography;

interface PropertyTableProps {
  properties: PropertyModel[];
}

export default function PropertyTable({ properties }: PropertyTableProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyModel | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setSelectedProperty(null);
    setModalOpen(true);
  };

  const handleEdit = (property: PropertyModel) => {
    setSelectedProperty(property);
    setModalOpen(true);
  };

  const handleSubmit = async (values: PropertyFormValues) => {
    setLoading(true);

    try {
      const result = selectedProperty
        ? await updatePropertyAction(selectedProperty.id, values)
        : await createPropertyAction(values);

      if (!result.success) {
        messageApi.error(result.message);
        return;
      }

      messageApi.success(result.message);
      setModalOpen(false);
      setSelectedProperty(null);

      // Refresh data setelah operasi berhasil
      router.refresh();
    } catch {
      messageApi.error("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);

    try {
      const result = await deletePropertyAction(id);

      if (!result.success) {
        messageApi.error(result.message);
        return;
      }

      messageApi.success(result.message);
      window.location.reload();
    } catch {
      messageApi.error("Gagal menghapus properti.");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<PropertyModel> = [
    {
      title: "No",
      key: "number",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Properti",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Alamat",
      dataIndex: "address",
      key: "address",
      render: (address: string | null) =>
        address || <Text type="secondary">Belum diisi</Text>,
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      render: (description: string | null) =>
        description || <Text type="secondary">-</Text>,
    },
    {
      title: "Tanggal Dibuat",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) =>
        new Intl.DateTimeFormat("id-ID", {
          dateStyle: "medium",
        }).format(new Date(date)),
    },
    {
      title: "Aksi",
      key: "action",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={loading}
            title="Edit properti"
          />

          <Popconfirm
            title="Hapus properti?"
            description={`Apakah Anda yakin ingin menghapus ${record.name}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true, loading }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={loading}
              title="Hapus properti"
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Daftar Properti</h2>
            <p className="text-sm text-slate-500">
              Kelola seluruh properti kontrakan Anda.
            </p>
          </div>

          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Tambah Properti
          </Button>
        </div>

        <Table<PropertyModel>
          rowKey="id"
          columns={columns}
          dataSource={properties}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} properti`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Belum ada properti"
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  Tambah Properti Pertama
                </Button>
              </Empty>
            ),
          }}
          scroll={{ x: 900 }}
        />

        <PropertyForm
          open={modalOpen}
          loading={loading}
          property={selectedProperty}
          onCancel={() => {
            setModalOpen(false);
            setSelectedProperty(null);
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </>
  );
}
