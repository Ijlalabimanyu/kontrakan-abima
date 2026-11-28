"use client";

import { Form } from "antd";
import { Button, Input, Modal, TextArea } from "@/components/ui";
import type {
  PropertyFormValues,
  PropertyModel,
} from "@/services/properties/interface";

interface PropertyFormProps {
  open: boolean;
  loading: boolean;
  property?: PropertyModel | null;
  onCancel: () => void;
  onSubmit: (values: PropertyFormValues) => void;
}

interface PropertyFormContentProps {
  loading: boolean;
  property?: PropertyModel | null;
  onCancel: () => void;
  onSubmit: (values: PropertyFormValues) => void;
}

const PropertyFormContent = ({
  loading,
  property,
  onCancel,
  onSubmit,
}: PropertyFormContentProps) => {
  const [form] = Form.useForm<PropertyFormValues>();

  const initialValues: PropertyFormValues = {
    name: property?.name ?? "",
    address: property?.address ?? "",
    description: property?.description ?? "",
  };

  return (
    <Form<PropertyFormValues>
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
      requiredMark="optional"
      className="space-y-1"
      disabled={loading}
    >
      {/* Property Name */}
      <Form.Item
        label="Nama Properti"
        name="name"
        rules={[
          {
            required: true,
            whitespace: true,
            message: "Nama properti wajib diisi.",
          },
          {
            max: 100,
            message: "Maksimal 100 karakter.",
          },
        ]}
      >
        <Input
          placeholder="Contoh: Kontrakan Abima Bekasi"
          maxLength={100}
          showCount
          autoComplete="off"
        />
      </Form.Item>

      {/* Property Address */}
      <Form.Item
        label="Alamat"
        name="address"
        rules={[
          {
            max: 500,
            message: "Maksimal 500 karakter.",
          },
        ]}
      >
        <TextArea
          placeholder="Masukkan alamat lengkap properti"
          rows={3}
          maxLength={500}
          showCount
        />
      </Form.Item>

      {/* Property Description */}
      <Form.Item
        label="Deskripsi"
        name="description"
        rules={[
          {
            max: 1000,
            message: "Maksimal 1000 karakter.",
          },
        ]}
      >
        <TextArea
          placeholder="Tambahkan deskripsi properti (opsional)"
          rows={4}
          maxLength={1000}
          showCount
        />
      </Form.Item>

      {/* Form Actions */}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          block
          className="sm:w-auto!"
        >
          Batal
        </Button>

        <Button
          variant="primary"
          htmlType="submit"
          loading={loading}
          disabled={loading}
          block
          className="sm:w-auto!"
        >
          {property ? "Simpan Perubahan" : "Tambah Properti"}
        </Button>
      </div>
    </Form>
  );
};

export default function PropertyForm({
  open,
  loading,
  property,
  onCancel,
  onSubmit,
}: PropertyFormProps) {
  const isEditing = Boolean(property);

  return (
    <Modal
      open={open}
      title={
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">
            {isEditing ? "Edit Properti" : "Tambah Properti"}
          </h2>

          <p className="text-xs font-normal text-muted">
            {isEditing
              ? "Perbarui informasi properti Anda."
              : "Lengkapi informasi properti yang akan didaftarkan."}
          </p>
        </div>
      }
      width="min(560px, calc(100vw - 32px))"
      centered
      destroyOnHidden
      closable={!loading}
      keyboard={!loading}
      mask={{ closable: !loading }}
      footer={null}
      onCancel={() => {
        if (!loading) {
          onCancel();
        }
      }}
      styles={{
        body: {
          maxHeight: "calc(100dvh - 180px)",
          overflowY: "auto",
          paddingTop: 20,
        },
      }}
    >
      <PropertyFormContent
        key={property?.id ?? "new-property"}
        property={property}
        loading={loading}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
