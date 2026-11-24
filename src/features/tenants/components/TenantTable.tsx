"use client";

import { useMemo, useState } from "react";
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
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { TenantModel } from "../interfaces/tenant.interfaces";
import { deleteTenant } from "@/services/tenants/actions";
import TenantFilter from "./TenantFilter";
import TenantForm from "./TenantForm";
import TenantDetailModal from "./TenantDetailModal";

interface TenantTableProps {
  tenants: TenantModel[];
}

export default function TenantTable({ tenants }: TenantTableProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<TenantModel | null>(
    null,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const filteredTenants = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return tenants;

    return tenants.filter((tenant) => {
      return (
        tenant.name.toLowerCase().includes(keyword) ||
        (tenant.phone ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [tenants, search]);

  const handleAdd = () => {
    setSelectedTenant(null);
    setFormOpen(true);
  };

  const handleEdit = (tenant: TenantModel) => {
    setSelectedTenant(tenant);
    setFormOpen(true);
  };

  const handleDetail = (tenant: TenantModel) => {
    setSelectedTenant(tenant);
    setDetailOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedTenant(null);
  };

  const handleSuccess = () => {
    handleCloseForm();
    router.refresh();
  };

  const handleDelete = async (tenantId: string) => {
    setIsDeleting(tenantId);

    try {
      const result = await deleteTenant(tenantId);

      if (!result.success) {
        messageApi.error(result.message);
        return;
      }

      messageApi.success(result.message);
      router.refresh();
    } catch {
      messageApi.error("Terjadi kesalahan saat menghapus penyewa");
    } finally {
      setIsDeleting(null);
    }
  };

  const columns: ColumnsType<TenantModel> = [
    {
      title: "No.",
      key: "index",
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Penyewa",
      dataIndex: "name",
      key: "name",
      render: (value: string) => (
        <Typography.Text strong>{value}</Typography.Text>
      ),
    },
    {
      title: "Nomor Telepon",
      dataIndex: "phone",
      key: "phone",
      render: (value: string | null) => value || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value: string | null) => value || "-",
    },
    {
      title: "Nomor Identitas",
      dataIndex: "identity_number",
      key: "identity_number",
      render: (value: string | null) => value || "-",
    },
    {
      title: "Aksi",
      key: "action",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            title="Detail penyewa"
            onClick={() => handleDetail(record)}
          />

          <Button
            type="text"
            icon={<EditOutlined />}
            title="Edit penyewa"
            onClick={() => handleEdit(record)}
          />

          <Popconfirm
            title="Hapus penyewa"
            description={`Apakah kamu yakin ingin menghapus ${record.name}?`}
            okText="Ya, hapus"
            cancelText="Batal"
            okButtonProps={{
              danger: true,
              loading: isDeleting === record.id,
            }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting === record.id}
              title="Hapus penyewa"
            />
          </Popconfirm>
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
              Daftar Penyewa
            </Typography.Title>

            <Typography.Text type="secondary">
              Total {tenants.length} penyewa terdaftar
            </Typography.Text>
          </div>

          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Tambah Penyewa
          </Button>
        </div>

        <TenantFilter search={search} onSearch={setSearch} />

        <div className="mt-4">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredTenants}
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} penyewa`,
            }}
            locale={{
              emptyText: (
                <div className="py-8">
                  <UserOutlined className="mb-2 text-3xl text-slate-300" />

                  <p className="text-slate-500">
                    {tenants.length === 0
                      ? "Belum ada penyewa"
                      : "Penyewa tidak ditemukan"}
                  </p>
                </div>
              ),
            }}
          />
        </div>
      </Card>

      <TenantForm
        open={formOpen}
        tenant={selectedTenant}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />

      <TenantDetailModal
        open={detailOpen}
        tenant={selectedTenant}
        onClose={() => {
          setDetailOpen(false);
          setSelectedTenant(null);
        }}
      />
    </>
  );
}
