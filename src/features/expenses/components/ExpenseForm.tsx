"use client";

import { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  message,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";

import {
  createExpense,
  updateExpense,
} from "@/services/expenses/actions";
import type {
  ExpenseCategory,
  ExpenseFormValues,
  ExpenseModel,
  ExpensePaymentMethod,
} from "../interfaces/expense.interface";

const { TextArea } = Input;

interface ExpenseFormProps {
  open: boolean;
  expense?: ExpenseModel | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ExpenseFormInput {
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: Dayjs;
  payment_method: ExpensePaymentMethod;
  reference_number?: string;
  notes?: string;
}

const categoryOptions = [
  { label: "Listrik", value: "ELECTRICITY" },
  { label: "Air", value: "WATER" },
  { label: "Internet / WiFi", value: "INTERNET" },
  { label: "Maintenance", value: "MAINTENANCE" },
  { label: "Kebersihan", value: "CLEANING" },
  { label: "Perlengkapan", value: "SUPPLIES" },
  { label: "Pajak", value: "TAX" },
  { label: "Lainnya", value: "OTHER" },
];

const paymentMethodOptions = [
  { label: "Tunai", value: "CASH" },
  { label: "Transfer", value: "TRANSFER" },
  { label: "QRIS", value: "QRIS" },
];

export default function ExpenseForm({
  open,
  expense,
  onClose,
  onSuccess,
}: ExpenseFormProps) {
  const [form] = Form.useForm<ExpenseFormInput>();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const isEdit = Boolean(expense);

  useEffect(() => {
    if (!open) return;

    if (expense) {
      form.setFieldsValue({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        expense_date: dayjs(expense.expense_date),
        payment_method: expense.payment_method,
        reference_number: expense.reference_number ?? undefined,
        notes: expense.notes ?? undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        expense_date: dayjs(),
        payment_method: "CASH",
      });
    }
  }, [open, expense, form]);

  const handleClose = () => {
    if (loading) return;

    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: ExpenseFormInput) => {
    setLoading(true);

    try {
      const payload: ExpenseFormValues = {
        category: values.category,
        description: values.description.trim(),
        amount: Number(values.amount),
        expense_date: values.expense_date.format("YYYY-MM-DD"),
        payment_method: values.payment_method,
        reference_number: values.reference_number?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
      };

      const result =
        isEdit && expense
          ? await updateExpense(expense.id, payload)
          : await createExpense(payload);

      if (!result.success) {
        messageApi.error(result.message);
        return;
      }

      messageApi.success(result.message);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("handleExpenseSubmit error:", error);
      messageApi.error("Terjadi kesalahan saat menyimpan pengeluaran");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <Modal
        title={isEdit ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
        open={open}
        onCancel={handleClose}
        footer={null}
        destroyOnHidden
        width={600}
        closable={!loading}
        maskClosable={!loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            name="category"
            label="Kategori Pengeluaran"
            rules={[
              {
                required: true,
                message: "Kategori pengeluaran wajib dipilih",
              },
            ]}
          >
            <Select
              placeholder="Pilih kategori pengeluaran"
              options={categoryOptions}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Deskripsi"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Deskripsi wajib diisi",
              },
              {
                max: 255,
                message: "Deskripsi maksimal 255 karakter",
              },
            ]}
          >
            <Input
              placeholder="Contoh: Pembayaran listrik bulan November"
              maxLength={255}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Nominal Pengeluaran"
            rules={[
              {
                required: true,
                message: "Nominal pengeluaran wajib diisi",
              },
              {
                type: "number",
                min: 0.01,
                message: "Nominal harus lebih besar dari 0",
              },
              {
                type: "number",
                max: 9999999999999.99,
                message: "Nominal terlalu besar",
              },
            ]}
          >
            <InputNumber<number>
              className="w-full"
              addonBefore="Rp"
              min={0.01}
              precision={2}
              placeholder="Masukkan nominal"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="expense_date"
            label="Tanggal Pengeluaran"
            rules={[
              {
                required: true,
                message: "Tanggal pengeluaran wajib dipilih",
              },
            ]}
          >
            <DatePicker
              className="w-full"
              format="DD MMMM YYYY"
              placeholder="Pilih tanggal pengeluaran"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="payment_method"
            label="Metode Pembayaran"
            rules={[
              {
                required: true,
                message: "Metode pembayaran wajib dipilih",
              },
            ]}
          >
            <Select
              placeholder="Pilih metode pembayaran"
              options={paymentMethodOptions}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="reference_number"
            label="Nomor Referensi"
            rules={[
              {
                max: 100,
                message: "Nomor referensi maksimal 100 karakter",
              },
            ]}
          >
            <Input
              placeholder="Contoh: Nomor transaksi atau transfer"
              maxLength={100}
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Catatan"
            rules={[
              {
                max: 500,
                message: "Catatan maksimal 500 karakter",
              },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Tambahkan catatan jika diperlukan"
              maxLength={500}
              showCount
              disabled={loading}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={handleClose} disabled={loading}>
              Batal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {isEdit ? "Simpan Perubahan" : "Simpan Pengeluaran"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
