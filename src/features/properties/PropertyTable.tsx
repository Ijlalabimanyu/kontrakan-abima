"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { message, Modal, Typography } from "antd";
import { Button, Card, ConfirmDialog, EmptyState } from "@/components/ui";
import { DataTable, TablePagination, TableToolbar } from "@/components/tables";
import {
  PropertyFormValues,
  PropertyModel,
} from "@/services/properties/interface";
import {
  createPropertyAction,
  deletePropertyAction,
  updatePropertyAction,
} from "@/services/properties/actions";
import { ColumnsType } from "antd/es/table";
import PropertyCard from "./components/PropertyCard";
import PropertyForm from "./PropertyForm";

const { Text } = Typography;

interface PropertyTableProps {
  properties: PropertyModel[];
}

function formatPropertyDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(date);
}

export default function PropertyTable({ properties }: PropertyTableProps) {
  const [messageApi, contextHolder] = message.useMessage();

  const router = useRouter();

  // Property Form
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedProperty, setSelectedProperty] =
    useState<PropertyModel | null>(null);

  const [formLoading, setFormLoading] = useState(false);

  // Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<PropertyModel | null>(null);
  const [deleteBlockedOpen, setDeleteBlockedOpen] = useState(false);
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(
    null,
  );

  // Search & Pagination
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  // -----------------------------------------
  // Search
  // -----------------------------------------

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");

    if (!query) {
      return properties;
    }

    return properties.filter((property) => {
      const searchableText = [
        property.name,
        property.address ?? "",
        property.description ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("id-ID");

      return searchableText.includes(query);
    });
  }, [properties, search]);

  // -----------------------------------------
  // Pagination
  // -----------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / pageSize),
  );

  // Derived state: memastikan halaman yang ditampilkan selalu valid.
  const effectiveCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProperties = useMemo(() => {
    const startIndex = (effectiveCurrentPage - 1) * pageSize;

    return filteredProperties.slice(startIndex, startIndex + pageSize);
  }, [filteredProperties, effectiveCurrentPage, pageSize]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // -----------------------------------------
  // Add & Edit
  // -----------------------------------------

  const handleAdd = () => {
    setSelectedProperty(null);
    setModalOpen(true);
  };

  const handleEdit = (property: PropertyModel) => {
    setSelectedProperty(property);
    setModalOpen(true);
  };

  const handleFormCancel = () => {
    if (formLoading) return;

    setModalOpen(false);
    setSelectedProperty(null);
  };

  const handleSubmit = async (values: PropertyFormValues) => {
    setFormLoading(true);

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

      router.refresh();
    } catch {
      messageApi.error("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setFormLoading(false);
    }
  };

  // -----------------------------------------
  // Delete
  // -----------------------------------------

  const handleDelete = async () => {
    if (!deleteTarget || deletingPropertyId) {
      return;
    }

    const propertyId = deleteTarget.id;

    setDeletingPropertyId(propertyId);

    try {
      const result = await deletePropertyAction(propertyId);

      if (!result.success) {
        if (result.message.includes("masih memiliki kamar")) {
          setDeleteTarget(null);
          setDeleteBlockedOpen(true);
          return;
        }

        messageApi.error(result.message);
        return;
      }

      messageApi.success(result.message);

      setDeleteTarget(null);

      router.refresh();
    } catch {
      messageApi.error("Gagal menghapus properti.");
    } finally {
      setDeletingPropertyId(null);
    }
  };

  // -----------------------------------------
  // Table Columns
  // -----------------------------------------

  const columns: ColumnsType<PropertyModel> = [
    {
      title: "No",
      key: "number",
      width: 70,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Nama Properti",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string) => (
        <Text strong className="text-foreground!">
          {name}
        </Text>
      ),
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
      width: 150,
      render: (date: string) => (
        <span className="text-sm text-muted">{formatPropertyDate(date)}</span>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="small"
            icon={<EditOutlined />}
            aria-label={`Edit ${record.name}`}
            disabled={formLoading || deletingPropertyId !== null}
            onClick={() => handleEdit(record)}
          />

          <Button
            variant="ghost"
            size="small"
            icon={<DeleteOutlined />}
            className="text-danger! hover:bg-danger-soft!"
            aria-label={`Hapus ${record.name}`}
            disabled={formLoading || deletingPropertyId !== null}
            onClick={() => setDeleteTarget(record)}
          />
        </div>
      ),
    },
  ];

  const isDeleting = deletingPropertyId !== null;

  return (
    <>
      {contextHolder}

      <div className="space-y-4">
        {/* Toolbar */}
        <TableToolbar
          title="Daftar Properti"
          description="Kelola seluruh informasi properti kontrakan Anda."
          search={{
            value: search,
            onChange: handleSearch,
            placeholder: "Cari nama, alamat, atau deskripsi...",
          }}
          actions={
            <Button
              variant="primary"
              onClick={handleAdd}
              icon={<PlusOutlined />}
              disabled={formLoading || isDeleting}
            >
              Tambah Properti
            </Button>
          }
        />

        {/* Desktop Table */}
        <Card className="hidden md:block">
          <DataTable<PropertyModel>
            rowKey="id"
            columns={columns}
            dataSource={paginatedProperties}
            loading={formLoading}
            pagination={false}
            scroll={{ x: 900 }}
            emptyTitle={
              properties.length === 0
                ? "Belum ada properti"
                : "Properti tidak ditemukan"
            }
            emptyDescription={
              properties.length === 0
                ? "Tambahkan properti pertama Anda untuk mulai mengelolanya."
                : "Coba gunakan kata kunci pencarian yang berbeda."
            }
            emptyAction={
              properties.length === 0 ? (
                <Button variant="primary" onClick={handleAdd}>
                  Tambah Properti Pertama
                </Button>
              ) : undefined
            }
          />

          {filteredProperties.length > 0 && (
            <TablePagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredProperties.length}
              onChange={(page, nextPageSize) => {
                setCurrentPage(page);
                setPageSize(nextPageSize);
              }}
            />
          )}
        </Card>

        {/* Mobile Property Cards */}

        {/* Mobile Property Cards */}
        <div className="md:hidden">
          {filteredProperties.length === 0 ? (
            <Card>
              <EmptyState
                title={
                  properties.length === 0
                    ? "Belum ada properti"
                    : "Properti tidak ditemukan"
                }
                description={
                  properties.length === 0
                    ? "Tambahkan properti pertama Anda."
                    : "Coba kata kunci pencarian lainnya."
                }
                action={
                  properties.length === 0 ? (
                    <Button onClick={handleAdd}>Tambah Properti Pertama</Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {paginatedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  disabled={formLoading || isDeleting}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}

          {filteredProperties.length > 0 && (
            <div className="mt-5">
              <TablePagination
                current={effectiveCurrentPage}
                pageSize={pageSize}
                total={filteredProperties.length}
                onChange={(page, nextPageSize) => {
                  setCurrentPage(page);
                  setPageSize(nextPageSize);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Existing Property Form */}
      <PropertyForm
        open={modalOpen}
        loading={formLoading}
        property={selectedProperty}
        onCancel={handleFormCancel}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Properti?"
        description={
          <>
            Apakah Anda yakin ingin menghapus{" "}
            <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat
            dibatalkan.
          </>
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        confirmVariant="danger"
        confirmLoading={deletingPropertyId !== null}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
      />

      {/* Property Delete Blocked Dialog */}
      <Modal
        open={deleteBlockedOpen}
        title={
          <div className="text-base font-semibold text-foreground">
            Properti Tidak Dapat Dihapus
          </div>
        }
        centered
        width={420}
        closable
        footer={
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => setDeleteBlockedOpen(false)}
            >
              Mengerti
            </Button>
          </div>
        }
        onCancel={() => setDeleteBlockedOpen(false)}
      >
        <div className="py-2">
          <p className="text-sm leading-relaxed text-muted">
            Properti ini masih memiliki kamar yang terdaftar. Hapus data kamar
            terlebih dahulu sebelum menghapus properti.
          </p>
        </div>
      </Modal>
    </>
  );
}
