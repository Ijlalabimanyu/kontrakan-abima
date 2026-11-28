"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ColumnsType } from "antd/es/table";
import { message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Card, ConfirmDialog, EmptyState } from "@/components/ui";
import { DataTable, TablePagination, TableToolbar } from "@/components/tables";
import type { TenantModel } from "@/services/tenants/interfaces";
import { deleteTenant } from "@/services/tenants/actions";
import TenantFilter from "./TenantFilter";
import TenantForm from "./TenantForm";
import TenantCard from "./TenantCard";
import TenantDetailModal from "./TenantDetailModal";
import { FormatDate } from "@/lib/utils";

interface TenantTableProps {
  tenants: TenantModel[];
}

export default function TenantTable({ tenants }: TenantTableProps) {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form
  const [selectedTenant, setSelectedTenant] = useState<TenantModel | null>(
    null,
  );
  const [formOpen, setFormOpen] = useState(false);

  // Detail
  const [detailTenant, setDetailTenant] = useState<TenantModel | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<TenantModel | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Search
  const filteredTenants = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("id-ID");

    if (!keyword) return tenants;

    return tenants.filter(
      (tenant) =>
        tenant.name.toLocaleLowerCase("id-ID").includes(keyword) ||
        (tenant.phone ?? "").toLocaleLowerCase("id-ID").includes(keyword),
    );
  }, [tenants, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / pageSize));
  const effectiveCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTenants = useMemo(() => {
    const startIndex = (effectiveCurrentPage - 1) * pageSize;
    return filteredTenants.slice(startIndex, startIndex + pageSize);
  }, [filteredTenants, effectiveCurrentPage, pageSize]);

  // Form
  const handleAdd = () => {
    setSelectedTenant(null);
    setFormOpen(true);
  };

  const handleEdit = (tenant: TenantModel) => {
    setSelectedTenant(tenant);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedTenant(null);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    router.refresh();
  };

  // Detail
  const handleDetail = (tenant: TenantModel) => {
    setDetailTenant(tenant);
    setDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailTenant(null);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    const tenantId = deleteTarget.id;

    setIsDeleting(tenantId);

    try {
      const result = await deleteTenant(tenantId);

      if (!result.success) {
        messageApi.error(result.message);
        return;
      }

      messageApi.success(result.message);

      setDeleteTarget(null);

      router.refresh();
    } catch {
      messageApi.error("Terjadi kesalahan saat menghapus penyewa.");
    } finally {
      setIsDeleting(null);
    }
  };

  // Table Columns
  const columns: ColumnsType<TenantModel> = [
    {
      title: "No.",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        (effectiveCurrentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Nama Penyewa",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (value: string) => (
        <span className="font-semibold text-foreground">{value}</span>
      ),
    },
    {
      title: "Nomor Telepon",
      dataIndex: "phone",
      key: "phone",
      width: 160,
      render: (value: string | null) => (
        <span className="text-sm text-foreground">{value || "-"}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (value: string | null) => (
        <span className="text-sm text-muted">{value || "-"}</span>
      ),
    },
    {
      title: "Nomor Identitas",
      dataIndex: "identity_number",
      key: "identity_number",
      width: 170,
      render: (value: string | null) => (
        <span className="text-sm text-muted">{value || "-"}</span>
      ),
    },
    {
      title: "Tanggal Terdaftar",
      dataIndex: "created_at",
      key: "created_at",
      width: 160,
      render: (value: string) => (
        <span className="text-sm text-muted">{FormatDate(value)}</span>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      fixed: "right",
      width: 130,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="small"
            icon={<EyeOutlined />}
            aria-label={`Detail ${record.name}`}
            disabled={isDeleting !== null}
            onClick={() => handleDetail(record)}
          />

          <Button
            variant="ghost"
            size="small"
            icon={<EditOutlined />}
            aria-label={`Edit ${record.name}`}
            disabled={isDeleting !== null}
            onClick={() => handleEdit(record)}
          />

          <Button
            variant="ghost"
            size="small"
            icon={<DeleteOutlined />}
            className="text-danger! hover:bg-danger-soft!"
            aria-label={`Hapus ${record.name}`}
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

      <div className="space-y-4">
        {/* Toolbar */}
        <TableToolbar
          title="Daftar Penyewa"
          description={`${filteredTenants.length} dari ${tenants.length} penyewa ditampilkan.`}
          filters={<TenantFilter search={search} onSearch={handleSearch} />}
          actions={
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={isDeleteLoading}
              block
              className="sm:w-auto!"
              icon={<PlusOutlined />}
            >
              Tambah Penyewa
            </Button>
          }
        />

        {/* Desktop Table */}
        <Card className="hidden md:block">
          <DataTable<TenantModel>
            rowKey="id"
            columns={columns}
            dataSource={paginatedTenants}
            pagination={false}
            loading={isDeleteLoading}
            scroll={{ x: 1050 }}
            emptyTitle={
              tenants.length === 0
                ? "Belum ada penyewa"
                : "Penyewa tidak ditemukan"
            }
            emptyDescription={
              tenants.length === 0
                ? "Tambahkan penyewa pertama untuk mulai mengelola data penyewa."
                : "Coba gunakan kata kunci pencarian lainnya."
            }
            emptyAction={
              tenants.length === 0 ? (
                <Button onClick={handleAdd}>Tambah Penyewa Pertama</Button>
              ) : undefined
            }
          />

          {filteredTenants.length > 0 && (
            <TablePagination
              current={effectiveCurrentPage}
              pageSize={pageSize}
              total={filteredTenants.length}
              onChange={(page, nextPageSize) => {
                setCurrentPage(page);
                setPageSize(nextPageSize);
              }}
            />
          )}
        </Card>

        {/* Mobile Tenant Cards */}
        <div className="space-y-5 md:hidden">
          {filteredTenants.length === 0 ? (
            <Card>
              <EmptyState
                title={
                  tenants.length === 0
                    ? "Belum ada penyewa"
                    : "Penyewa tidak ditemukan"
                }
                description={
                  tenants.length === 0
                    ? "Tambahkan penyewa pertama untuk mulai mengelola data penyewa."
                    : "Coba gunakan kata kunci pencarian lainnya."
                }
                action={
                  tenants.length === 0 ? (
                    <Button onClick={handleAdd}>Tambah Penyewa Pertama</Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {paginatedTenants.map((tenant) => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  disabled={isDeleteLoading}
                  onDetail={handleDetail}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}

          {filteredTenants.length > 0 && (
            <div className="pt-1">
              <TablePagination
                current={effectiveCurrentPage}
                pageSize={pageSize}
                total={filteredTenants.length}
                onChange={(page, nextPageSize) => {
                  setCurrentPage(page);
                  setPageSize(nextPageSize);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit */}
      <TenantForm
        open={formOpen}
        tenant={selectedTenant}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />

      {/* Detail */}
      <TenantDetailModal
        open={detailOpen}
        tenant={detailTenant}
        onClose={handleCloseDetail}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Penyewa?"
        description={
          <>
            Apakah Anda yakin ingin menghapus data penyewa{" "}
            <strong>{deleteTarget?.name}</strong>? Data tidak dapat dihapus jika
            masih memiliki riwayat kontrak.
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
