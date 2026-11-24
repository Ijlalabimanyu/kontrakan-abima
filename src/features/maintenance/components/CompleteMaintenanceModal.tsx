"use client";

import { useEffect } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
} from "antd";
import dayjs from "dayjs";

import type { MaintenanceModel } from "../interfaces/maintenance.interface";
import { completeMaintenance } from "@/services/maintenance/actions";

const { TextArea } = Input;

interface Props {
  open: boolean;
  maintenance: MaintenanceModel | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompleteMaintenanceModal({
  open,
  maintenance,
  onClose,
  onSuccess,
}: Props) {
  const [form] = Form.useForm();
  const costAmount = Form.useWatch("cost_amount", form) ?? 0;

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    form.setFieldsValue({
      cost_amount: 0,
      completion_notes: "",
      cost_description: "",
      expense_date: dayjs(),
      payment_method: "CASH",
      reference_number: "",
    });
  }, [open, form]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!maintenance) return;

    const result = await completeMaintenance(maintenance.id, {
      completion_notes: (values.completion_notes as string) || "",
      cost_amount: Number(values.cost_amount ?? 0),
      cost_description: (values.cost_description as string) || "",
      expense_date: values.expense_date
        ? (values.expense_date as dayjs.Dayjs).format("YYYY-MM-DD")
        : null,
      payment_method:
        (values.payment_method as "CASH" | "TRANSFER" | "QRIS") || null,
      reference_number: (values.reference_number as string) || "",
    });

    if (!result.success) {
      Modal.error({
        title: "Gagal menyelesaikan maintenance",
        content: result.message,
      });
      return;
    }

    Modal.success({ title: "Maintenance selesai", content: result.message });
    onSuccess();
    onClose();
  };

  return (
    <Modal
      title="Selesaikan Maintenance"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <div className="mb-4 rounded-lg bg-slate-50 p-3">
        <p className="font-medium">{maintenance?.title}</p>
        <p className="text-sm text-slate-500">
          {maintenance?.property_name}
          {maintenance?.room_number
            ? ` · Kamar ${maintenance.room_number}`
            : ""}
        </p>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="completion_notes" label="Catatan penyelesaian">
          <TextArea rows={3} placeholder="Catatan pekerjaan..." />
        </Form.Item>

        <Form.Item
          name="cost_amount"
          label="Biaya maintenance"
          rules={[{ required: true, message: "Masukkan biaya" }]}
        >
          <InputNumber
            className="w-full"
            min={0}
            precision={2}
            addonBefore="Rp"
            placeholder="0"
          />
        </Form.Item>

        {costAmount > 0 && (
          <>
            <Form.Item
              name="cost_description"
              label="Keterangan biaya"
              rules={[
                { required: true, message: "Keterangan biaya wajib diisi" },
              ]}
            >
              <Input placeholder="Contoh: Penggantian kompresor AC" />
            </Form.Item>
            <Form.Item
              name="expense_date"
              label="Tanggal pengeluaran"
              rules={[{ required: true, message: "Pilih tanggal" }]}
            >
              <DatePicker className="w-full" format="DD MMM YYYY" />
            </Form.Item>
            <Form.Item
              name="payment_method"
              label="Metode pembayaran"
              rules={[{ required: true, message: "Pilih metode pembayaran" }]}
            >
              <Select
                options={[
                  { label: "Tunai", value: "CASH" },
                  { label: "Transfer", value: "TRANSFER" },
                  { label: "QRIS", value: "QRIS" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="reference_number"
              label="Nomor referensi (opsional)"
            >
              <Input placeholder="Nomor transaksi" />
            </Form.Item>
          </>
        )}

        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          {costAmount > 0
            ? "Pengeluaran akan otomatis dicatat pada Finance dengan kategori MAINTENANCE."
            : "Tidak ada biaya yang dicatat karena nominal biaya adalah Rp0."}
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Batal</Button>
          <Button type="primary" htmlType="submit">
            Selesaikan
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
