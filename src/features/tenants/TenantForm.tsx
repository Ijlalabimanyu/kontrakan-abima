"use client";

import { useTransition } from "react";
import { Form, message } from "antd";
import { Button, Input, Modal, TextArea } from "@/components/ui";
import type {
  TenantModel,
  TenantFormValues,
} from "@/services/tenants/interfaces";
import { createTenant, updateTenant } from "@/services/tenants/actions";
import type { TenantActionState } from "@/services/tenants/actions";

interface TenantFormProps {
  open: boolean;
  tenant: TenantModel | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface TenantFormContentProps {
  tenant: TenantModel | null;
  onClose: () => void;
  onSuccess: () => void;
}

const initialState: TenantActionState = {
  success: false,
  message: "",
};

const TenantFormContent = ({
  tenant,
  onClose,
  onSuccess,
}: TenantFormContentProps) => {
  const [form] = Form.useForm<TenantFormValues>();
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = message.useMessage();

  const initialValues: TenantFormValues = {
    name: tenant?.name ?? "",
    phone: tenant?.phone ?? "",
    email: tenant?.email ?? "",
    identity_number: tenant?.identity_number ?? "",
    address: tenant?.address ?? "",
  };

  const handleSubmit = (values: TenantFormValues) => {
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("phone", values.phone);
    formData.append("email", values.email ?? "");
    formData.append("identity_number", values.identity_number ?? "");
    formData.append("address", values.address ?? "");

    if (tenant) {
      formData.append("id", tenant.id);
    }

    startTransition(async () => {
      try {
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
      } catch {
        messageApi.error("Terjadi kesalahan saat menyimpan data penyewa.");
      }
    });
  };

  return (
    <>
      {contextHolder}

      <Form<TenantFormValues>
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        requiredMark="optional"
        disabled={isPending}
      >
        {/* Name */}
        <Form.Item
          name="name"
          label="Nama Lengkap"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Nama wajib diisi.",
            },
            {
              min: 3,
              message: "Nama minimal 3 karakter.",
            },
            {
              max: 150,
              message: "Nama maksimal 150 karakter.",
            },
          ]}
        >
          <Input
            placeholder="Masukkan nama lengkap"
            maxLength={150}
            autoComplete="name"
          />
        </Form.Item>

        {/* Phone */}
        <Form.Item
          name="phone"
          label="Nomor Telepon"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Nomor telepon wajib diisi.",
            },
            {
              max: 30,
              message: "Nomor telepon maksimal 30 karakter.",
            },
            {
              validator: async (_, value?: string) => {
                if (!value?.trim()) return;

                const digits = value.replace(/\D/g, "");

                const isValid =
                  /^\+?[0-9\s()-]+$/.test(value) &&
                  digits.length >= 8 &&
                  digits.length <= 15;

                if (!isValid) {
                  throw new Error("Format nomor telepon tidak valid.");
                }
              },
            },
          ]}
        >
          <Input
            placeholder="Contoh: 081234567890"
            maxLength={30}
            autoComplete="tel"
          />
        </Form.Item>

        {/* Email */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              type: "email",
              message: "Format email tidak valid.",
            },
            {
              max: 150,
              message: "Email maksimal 150 karakter.",
            },
          ]}
        >
          <Input
            type="email"
            placeholder="Contoh: email@gmail.com"
            maxLength={150}
            autoComplete="email"
          />
        </Form.Item>

        {/* Identity Number */}
        <Form.Item
          name="identity_number"
          label="Nomor Identitas"
          rules={[
            {
              max: 100,
              message: "Nomor identitas maksimal 100 karakter.",
            },
          ]}
        >
          <Input placeholder="Masukkan nomor identitas" maxLength={100} />
        </Form.Item>

        {/* Address */}
        <Form.Item
          name="address"
          label="Alamat"
          rules={[
            {
              max: 1000,
              message: "Alamat maksimal 1000 karakter.",
            },
          ]}
        >
          <TextArea
            rows={4}
            maxLength={1000}
            showCount
            placeholder="Masukkan alamat lengkap penyewa"
          />
        </Form.Item>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            block
            className="sm:w-auto!"
            disabled={isPending}
            onClick={onClose}
          >
            Batal
          </Button>

          <Button
            variant="primary"
            htmlType="submit"
            loading={isPending}
            disabled={isPending}
            block
            className="sm:w-auto!"
          >
            {tenant ? "Simpan Perubahan" : "Tambah Penyewa"}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default function TenantForm({
  open,
  tenant,
  onClose,
  onSuccess,
}: TenantFormProps) {
  const isEditing = Boolean(tenant);

  return (
    <Modal
      open={open}
      title={
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">
            {isEditing ? "Edit Penyewa" : "Tambah Penyewa"}
          </h2>

          <p className="text-xs font-normal text-muted">
            {isEditing
              ? "Perbarui informasi pribadi penyewa."
              : "Lengkapi informasi penyewa yang akan didaftarkan."}
          </p>
        </div>
      }
      width="min(560px, calc(100vw - 32px))"
      centered
      footer={null}
      destroyOnHidden
      closable
      onCancel={onClose}
      styles={{
        body: {
          maxHeight: "calc(100dvh - 180px)",
          overflowY: "auto",
          paddingTop: 20,
        },
      }}
    >
      {open && (
        <TenantFormContent
          key={tenant?.id ?? "new-tenant"}
          tenant={tenant}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
