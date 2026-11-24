"use client";

import { useEffect, useTransition } from "react";
import { Button, Form, Input, Modal, message } from "antd";

import { TenantModel } from "../interfaces/tenant.interfaces";
import {
  createTenant,
  updateTenant,
  TenantActionState,
} from "@/services/tenants/actions";

interface TenantFormProps {
  open: boolean;
  tenant: TenantModel | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface TenantFormInput {
  name: string;
  phone: string;
  email: string;
  identity_number: string;
  address: string;
}

const initialState: TenantActionState = {
  success: false,
  message: "",
};

export default function TenantForm({
  open,
  tenant,
  onClose,
  onSuccess,
}: TenantFormProps) {
  const [form] = Form.useForm<TenantFormInput>();
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      name: tenant?.name ?? "",
      phone: tenant?.phone ?? "",
      email: tenant?.email ?? "",
      identity_number: tenant?.identity_number ?? "",
      address: tenant?.address ?? "",
    });
  }, [open, tenant, form]);

  const handleSubmit = (values: TenantFormInput) => {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });

    if (tenant) {
      formData.append("id", tenant.id);
    }

    startTransition(async () => {
      const result = tenant
        ? await updateTenant(initialState, formData)
        : await createTenant(initialState, formData);

      if (!result.success) {
        messageApi.error(result.message);
        return;
      }

      messageApi.success(result.message);
      form.resetFields();
      onSuccess();
    });
  };

  return (
    <>
      {contextHolder}

      <Modal
        title={tenant ? "Edit Penyewa" : "Tambah Penyewa"}
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            name="name"
            label="Nama Lengkap"
            rules={[
              { required: true, message: "Nama wajib diisi" },
              { min: 3, message: "Nama minimal 3 karakter" },
              { max: 150, message: "Nama maksimal 150 karakter" },
            ]}
          >
            <Input placeholder="Masukkan nama lengkap" maxLength={150} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Nomor Telepon"
            rules={[
              { required: true, message: "Nomor telepon wajib diisi" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();

                  const digits = value.replace(/\D/g, "");

                  if (
                    !/^\+?[0-9\s()-]+$/.test(value) ||
                    digits.length < 8 ||
                    digits.length > 15
                  ) {
                    return Promise.reject(
                      new Error("Format nomor telepon tidak valid"),
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Contoh: 081234567890" maxLength={30} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: "email", message: "Format email tidak valid" },
              { max: 150, message: "Email maksimal 150 karakter" },
            ]}
          >
            <Input
              type="email"
              placeholder="Contoh: email@gmail.com"
              maxLength={150}
            />
          </Form.Item>

          <Form.Item
            name="identity_number"
            label="Nomor Identitas"
            rules={[{ max: 100, message: "Maksimal 100 karakter" }]}
          >
            <Input placeholder="Masukkan nomor identitas" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="address"
            label="Alamat"
            rules={[{ max: 1000, message: "Alamat maksimal 1000 karakter" }]}
          >
            <Input.TextArea
              rows={3}
              maxLength={1000}
              showCount
              placeholder="Masukkan alamat penyewa"
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Batal</Button>

            <Button type="primary" htmlType="submit" loading={isPending}>
              {tenant ? "Simpan Perubahan" : "Tambah Penyewa"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
