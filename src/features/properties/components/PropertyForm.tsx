"use client";

import { useEffect } from "react";
import { Form, Input, Modal } from "antd";
import {
  PropertyFormValues,
  PropertyModel,
} from "../interfaces/property.interface";

interface PropertyFormProps {
  open: boolean;
  loading: boolean;
  property?: PropertyModel | null;
  onCancel: () => void;
  onSubmit: (values: PropertyFormValues) => void;
}

export default function PropertyForm({
  open,
  loading,
  property,
  onCancel,
  onSubmit,
}: PropertyFormProps) {
  const [form] = Form.useForm<PropertyFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: property?.name ?? "",
        address: property?.address ?? "",
        description: property?.description ?? "",
      });
    } else {
      form.resetFields();
    }
  }, [open, property, form]);

  return (
    <Modal
      title={property ? "Edit Properti" : "Tambah Properti"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={property ? "Simpan Perubahan" : "Tambah Properti"}
      cancelText="Batal"
      confirmLoading={loading}
      destroyOnHidden
      centered
    >
      <Form<PropertyFormValues>
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark="optional"
      >
        <Form.Item
          label="Nama Properti"
          name="name"
          rules={[
            { required: true, message: "Nama properti wajib diisi." },
            { max: 100, message: "Maksimal 100 karakter." },
          ]}
        >
          <Input placeholder="Contoh: Kontrakan Abima" maxLength={100} />
        </Form.Item>

        <Form.Item
          label="Alamat"
          name="address"
          rules={[{ max: 500, message: "Maksimal 500 karakter." }]}
        >
          <Input.TextArea
            placeholder="Masukkan alamat properti"
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="Deskripsi"
          name="description"
          rules={[{ max: 1000, message: "Maksimal 1000 karakter." }]}
        >
          <Input.TextArea
            placeholder="Tambahkan deskripsi properti (opsional)"
            rows={3}
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
