"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StarOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Tabs,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";

import type {
  BusinessSettingsFormValues,
  OwnerProfileFormValues,
  PaymentAccountFormValues,
  PaymentAccountModel,
  PreferenceFormValues,
  SettingsPageData,
} from "@/services/settings/interface";
import {
  createPaymentAccount,
  deletePaymentAccount,
  setDefaultPaymentAccount,
  updateAccountPassword,
  updateBusinessSettings,
  updateOwnerProfile,
  updatePaymentAccount,
  updatePaymentAccountStatus,
  updatePreferences,
  uploadQrisImage,
} from "@/services/settings/actions";

const { TextArea } = Input;
type SettingsActionResult = { success: boolean; message: string };

export default function SettingsPageClient({
  data,
}: {
  data: SettingsPageData;
}) {
  const router = useRouter();
  const [profileForm] = Form.useForm<OwnerProfileFormValues>();
  const [businessForm] = Form.useForm<BusinessSettingsFormValues>();
  const [preferenceForm] = Form.useForm<PreferenceFormValues>();
  const [passwordForm] = Form.useForm();
  const [accountForm] = Form.useForm<PaymentAccountFormValues>();
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<PaymentAccountModel | null>(null);
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const accountType = Form.useWatch("account_type", accountForm);

  useEffect(() => {
    profileForm.setFieldsValue({
      owner_name: data.settings.owner_name ?? "",
      contact_phone: data.settings.contact_phone ?? "",
    });
    businessForm.setFieldsValue({
      business_name: data.settings.business_name ?? "",
      business_address: data.settings.business_address ?? "",
      business_description: data.settings.business_description ?? "",
    });
    preferenceForm.setFieldsValue({
      currency: data.settings.currency,
      timezone: data.settings.timezone,
      date_format: data.settings.date_format,
    });
  }, [data, profileForm, businessForm, preferenceForm]);

  const handleSave = async <T,>(
    action: (values: T) => Promise<SettingsActionResult>,
    values: T,
  ) => {
    setSaving(true);
    try {
      const result = await action(values);
      if (!result.success) return message.error(result.message);
      message.success(result.message);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const openAccountModal = (account?: PaymentAccountModel) => {
    setSelectedAccount(account ?? null);
    setQrisFile(null);
    accountForm.resetFields();
    accountForm.setFieldsValue(
      account
        ? {
            account_type: account.account_type,
            label: account.label,
            bank_name: account.bank_name ?? "",
            account_name: account.account_name ?? "",
            account_number: account.account_number ?? "",
            is_active: account.is_active,
            is_default: account.is_default,
          }
        : {
            account_type: "BANK_TRANSFER",
            label: "",
            bank_name: "",
            account_name: "",
            account_number: "",
            is_active: true,
            is_default: false,
          },
    );
    setModalOpen(true);
  };

  const submitAccount = async (values: PaymentAccountFormValues) => {
    setSaving(true);
    try {
      const result = selectedAccount
        ? await updatePaymentAccount(selectedAccount.id, values)
        : await createPaymentAccount(values);
      if (!result.success) return message.error(result.message);
      const accountId = selectedAccount?.id ?? result.data?.id;
      if (values.account_type === "QRIS" && qrisFile && accountId) {
        const formData = new FormData();
        formData.append("file", qrisFile);
        const uploadResult = await uploadQrisImage(accountId, formData);
        if (!uploadResult.success) {
          message.error(uploadResult.message);
          router.refresh();
          return;
        }
      }
      message.success(result.message);
      setModalOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const uploadQris = async (account: PaymentAccountModel, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadQrisImage(account.id, formData);
    if (!result.success) {
      message.error(result.message);
      return;
    }

    message.success(result.message);
    router.refresh();
  };

  const profileTab = (
    <Card title="Profil Pemilik">
      <Form
        form={profileForm}
        layout="vertical"
        onFinish={(values) => handleSave(updateOwnerProfile, values)}
      >
        <Form.Item label="Email akun">
          <Input value={data.email} disabled />
          <Typography.Text type="secondary">
            Email dikelola melalui Supabase Auth.
          </Typography.Text>
        </Form.Item>
        <Form.Item
          name="owner_name"
          label="Nama pemilik"
          rules={[{ required: true, message: "Nama wajib diisi" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="contact_phone" label="Nomor telepon">
          <Input placeholder="081234567890" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>
          Simpan Profil
        </Button>
      </Form>
    </Card>
  );
  const businessTab = (
    <Card title="Informasi Kontrakan">
      <Form
        form={businessForm}
        layout="vertical"
        onFinish={(values) => handleSave(updateBusinessSettings, values)}
      >
        <Form.Item name="business_name" label="Nama usaha">
          <Input placeholder="Kontrakan Abima" />
        </Form.Item>
        <Form.Item name="business_address" label="Alamat kontrakan">
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item name="business_description" label="Deskripsi">
          <TextArea rows={3} />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>
          Simpan Informasi
        </Button>
      </Form>
    </Card>
  );
  const preferencesTab = (
    <Card title="Preferensi Aplikasi">
      <Form
        form={preferenceForm}
        layout="vertical"
        onFinish={(values) => handleSave(updatePreferences, values)}
      >
        <Form.Item name="currency" label="Mata uang">
          <Select options={[{ label: "Rupiah (IDR)", value: "IDR" }]} />
        </Form.Item>
        <Form.Item name="timezone" label="Zona waktu">
          <Select
            options={[
              { label: "WIB - Asia/Jakarta", value: "Asia/Jakarta" },
              { label: "WITA - Asia/Makassar", value: "Asia/Makassar" },
              { label: "WIT - Asia/Jayapura", value: "Asia/Jayapura" },
            ]}
          />
        </Form.Item>
        <Form.Item name="date_format" label="Format tanggal">
          <Select
            options={[
              { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
              { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
              { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
            ]}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>
          Simpan Preferensi
        </Button>
      </Form>
    </Card>
  );
  const securityTab = (
    <Card title="Keamanan Akun">
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={async (values) => {
          const result = await updateAccountPassword(values);
          if (!result.success) return message.error(result.message);
          message.success(result.message);
          passwordForm.resetFields();
        }}
      >
        <Form.Item
          name="password"
          label="Password baru"
          rules={[
            { required: true },
            { min: 8, message: "Minimal 8 karakter" },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirm_password"
          label="Konfirmasi password"
          dependencies={["password"]}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                !value || getFieldValue("password") === value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Konfirmasi password tidak sama")),
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Perbarui Password
        </Button>
      </Form>
    </Card>
  );

  const paymentTab = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title level={5} className="!mb-1">
            Metode Pembayaran
          </Typography.Title>
          <Typography.Text type="secondary">
            Kelola rekening bank dan QRIS untuk informasi pembayaran.
          </Typography.Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openAccountModal()}
        >
          Tambah Metode
        </Button>
      </div>
      {data.paymentAccounts.length === 0 ? (
        <Card>
          <div className="py-8 text-center text-slate-500">
            Belum ada metode pembayaran.
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.paymentAccounts.map((account) => (
            <Card
              key={account.id}
              title={account.label}
              extra={
                account.is_default ? <Tag color="success">Default</Tag> : null
              }
            >
              <Space direction="vertical" className="w-full">
                <Space wrap>
                  <Tag color="blue">
                    {account.account_type === "QRIS" ? "QRIS" : "Transfer Bank"}
                  </Tag>
                  <Tag color={account.is_active ? "success" : "default"}>
                    {account.is_active ? "Aktif" : "Nonaktif"}
                  </Tag>
                </Space>
                {account.account_type === "BANK_TRANSFER" ? (
                  <>
                    <Typography.Text strong>
                      {account.bank_name}
                    </Typography.Text>
                    <Typography.Text>{account.account_name}</Typography.Text>
                    <Typography.Text copyable>
                      {account.account_number}
                    </Typography.Text>
                  </>
                ) : (
                  <>
                    {account.qris_signed_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Signed Supabase Storage URLs are user-uploaded QRIS assets with dynamic dimensions.
                      <img
                        src={account.qris_signed_url}
                        alt={`QRIS ${account.label}`}
                        className="max-h-56 w-auto rounded-lg border object-contain"
                      />
                    ) : (
                      <div className="rounded-lg bg-slate-50 p-6 text-center text-slate-500">
                        Gambar QRIS belum diunggah.
                      </div>
                    )}
                    <Upload
                      accept="image/jpeg,image/png,image/webp"
                      maxCount={1}
                      showUploadList={false}
                      beforeUpload={(file) => {
                        if (file.size > 2 * 1024 * 1024) {
                          message.error("Ukuran maksimal 2 MB");
                          return Upload.LIST_IGNORE;
                        }
                        void uploadQris(account, file);
                        return false;
                      }}
                    >
                      <Button icon={<UploadOutlined />}>
                        Upload / Ganti QRIS
                      </Button>
                    </Upload>
                  </>
                )}
                <div className="flex flex-wrap gap-2 border-t pt-3">
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openAccountModal(account)}
                  >
                    Edit
                  </Button>
                  {!account.is_default && account.is_active && (
                    <Button
                      size="small"
                      icon={<StarOutlined />}
                      onClick={async () => {
                        const result = await setDefaultPaymentAccount(
                          account.id,
                        );
                        if (!result.success) {
                          message.error(result.message);
                          return;
                        }

                        message.success(result.message);
                        router.refresh();
                      }}
                    >
                      Jadikan Default
                    </Button>
                  )}
                  <Button
                    size="small"
                    onClick={async () => {
                      const result = await updatePaymentAccountStatus(
                        account.id,
                        !account.is_active,
                      );
                      if (!result.success) {
                        message.error(result.message);
                        return;
                      }

                      message.success(result.message);
                      router.refresh();
                    }}
                  >
                    {account.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      Modal.confirm({
                        title: "Hapus metode pembayaran?",
                        content: `Metode "${account.label}" akan dihapus.`,
                        okText: "Hapus",
                        okButtonProps: { danger: true },
                        cancelText: "Batal",
                        onOk: async () => {
                          const result = await deletePaymentAccount(account.id);
                          if (!result.success) {
                            message.error(result.message);
                            return;
                          }

                          message.success(result.message);
                          router.refresh();
                        },
                      })
                    }
                  >
                    Hapus
                  </Button>
                </div>
              </Space>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={3} className="!mb-1">
          Pengaturan
        </Typography.Title>
        <Typography.Text type="secondary">
          Kelola profil, informasi kontrakan, pembayaran, dan keamanan akun.
        </Typography.Text>
      </div>
      <Tabs
        items={[
          { key: "profile", label: "Profil Pemilik", children: profileTab },
          {
            key: "business",
            label: "Informasi Kontrakan",
            children: businessTab,
          },
          { key: "payment", label: "Pembayaran", children: paymentTab },
          { key: "preferences", label: "Preferensi", children: preferencesTab },
          { key: "security", label: "Keamanan", children: securityTab },
        ]}
      />
      <Modal
        title={
          selectedAccount
            ? "Edit Metode Pembayaran"
            : "Tambah Metode Pembayaran"
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => accountForm.submit()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={accountForm} layout="vertical" onFinish={submitAccount}>
          <Form.Item
            name="account_type"
            label="Jenis pembayaran"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Transfer Bank", value: "BANK_TRANSFER" },
                { label: "QRIS", value: "QRIS" },
              ]}
              onChange={() => setQrisFile(null)}
            />
          </Form.Item>
          <Form.Item
            name="label"
            label="Nama metode"
            rules={[{ required: true, message: "Nama metode wajib diisi" }]}
          >
            <Input />
          </Form.Item>
          {accountType === "BANK_TRANSFER" && (
            <>
              <Form.Item
                name="bank_name"
                label="Nama bank"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="account_name"
                label="Nama pemilik rekening"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="account_number"
                label="Nomor rekening"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </>
          )}
          {accountType === "QRIS" && (
            <Form.Item label="Gambar QRIS">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (file && file.size > 2 * 1024 * 1024) {
                    message.error("Ukuran gambar maksimal 2 MB");
                    event.target.value = "";
                    setQrisFile(null);
                    return;
                  }
                  setQrisFile(file);
                }}
              />
              <Typography.Text type="secondary">
                Maksimal 2 MB. Format JPG, PNG, atau WebP.
              </Typography.Text>
            </Form.Item>
          )}
          <Form.Item
            name="is_active"
            label="Status aktif"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="is_default"
            label="Jadikan default"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
