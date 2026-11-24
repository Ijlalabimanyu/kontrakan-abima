"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  message,
} from "antd";
import type { UploadFile } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

import {
  createPayment,
  uploadPaymentProof,
} from "@/services/payments/actions";
import {
  PaymentFormValues,
  PaymentInvoiceOption,
  PaymentMethod,
} from "../interfaces/payment.interface";
import PaymentProofUpload from "./PaymentProofUpload";

interface PaymentFormProps {
  open: boolean;
  invoices: PaymentInvoiceOption[];
  onClose: () => void;
}

interface FormValues {
  invoice_id: string;
  amount: number;
  payment_date: Dayjs;
  payment_method: PaymentMethod;
  reference_number?: string;
  notes?: string;
  proof_file?: UploadFile[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function PaymentForm({
  open,
  invoices,
  onClose,
}: PaymentFormProps) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const selectedInvoiceId = Form.useWatch("invoice_id", form);
  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId),
    [invoices, selectedInvoiceId],
  );

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    form.setFieldsValue({
      payment_date: dayjs(),
      payment_method: "TRANSFER",
    });
  }, [open, form]);

  useEffect(() => {
    if (!selectedInvoice) return;

    form.setFieldValue("amount", selectedInvoice.remaining_amount);
  }, [selectedInvoice, form]);

  const handleClose = () => {
    if (loading) return;

    form.resetFields();
    onClose();
  };

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);

    try {
      let proofPath: string | null = null;
      const selectedFile = values.proof_file?.[0]?.originFileObj;

      if (selectedFile) {
        const uploadResult = await uploadPaymentProof(
          values.invoice_id,
          selectedFile,
        );

        if (!uploadResult.success || !uploadResult.path) {
          messageApi.error(uploadResult.message);
          return;
        }

        proofPath = uploadResult.path;
      }

      const payload: PaymentFormValues = {
        invoice_id: values.invoice_id,
        amount: values.amount,
        payment_date: values.payment_date.format("YYYY-MM-DD"),
        payment_method: values.payment_method,
        reference_number: values.reference_number?.trim(),
        notes: values.notes?.trim(),
      };
      const response = await createPayment(payload, proofPath);

      if (!response.success) {
        messageApi.error(response.message);
        return;
      }

      messageApi.success(response.message);
      form.resetFields();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Submit payment error:", error);
      messageApi.error("Gagal mencatat pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <Modal
        title="Catat Pembayaran"
        open={open}
        onCancel={handleClose}
        onOk={() => form.submit()}
        okText="Simpan Pembayaran"
        cancelText="Batal"
        confirmLoading={loading}
        closable={!loading}
        maskClosable={!loading}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="invoice_id"
            label="Invoice"
            rules={[
              { required: true, message: "Pilih invoice terlebih dahulu" },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Pilih invoice"
              options={invoices.map((invoice) => ({
                value: invoice.id,
                label: `${invoice.invoice_number} - ${invoice.tenant_name} (${invoice.room_number})`,
              }))}
              disabled={loading}
            />
          </Form.Item>

          {selectedInvoice && (
            <Alert
              type="info"
              showIcon
              className="mb-4"
              message={selectedInvoice.invoice_number}
              description={
                <div className="space-y-1">
                  <div>
                    Total tagihan:{" "}
                    <strong>{formatCurrency(selectedInvoice.amount)}</strong>
                  </div>
                  <div>
                    Sudah dibayar:{" "}
                    <strong>
                      {formatCurrency(selectedInvoice.paid_amount)}
                    </strong>
                  </div>
                  <div>
                    Sisa tagihan:{" "}
                    <strong>
                      {formatCurrency(selectedInvoice.remaining_amount)}
                    </strong>
                  </div>
                </div>
              }
            />
          )}

          <Form.Item
            name="amount"
            label="Nominal Pembayaran"
            rules={[
              { required: true, message: "Masukkan nominal pembayaran" },
              {
                type: "number",
                min: 1,
                message: "Nominal harus lebih dari 0",
              },
              {
                validator: async (_, value: number | undefined) => {
                  if (
                    value != null &&
                    selectedInvoice &&
                    value > selectedInvoice.remaining_amount
                  ) {
                    throw new Error("Nominal melebihi sisa tagihan");
                  }
                },
              },
            ]}
          >
            <InputNumber<number>
              className="!w-full"
              min={1}
              max={selectedInvoice?.remaining_amount}
              precision={2}
              controls={false}
              placeholder="Masukkan nominal pembayaran"
              disabled={!selectedInvoice || loading}
              formatter={(value) => {
                if (value == null) return "";

                const [integer, decimal] = String(value).split(".");
                const formattedInteger = integer.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ".",
                );

                return `Rp ${formattedInteger}${decimal ? `,${decimal}` : ""}`;
              }}
              parser={(value) => {
                const normalized = (value ?? "")
                  .replace(/[^\d,.]/g, "")
                  .replace(/\./g, "")
                  .replace(",", ".");
                const parsed = Number(normalized);

                return Number.isFinite(parsed) ? parsed : 0;
              }}
            />
          </Form.Item>

          <Form.Item
            name="payment_date"
            label="Tanggal Pembayaran"
            rules={[
              { required: true, message: "Pilih tanggal pembayaran" },
            ]}
          >
            <DatePicker
              className="w-full"
              format="DD MMMM YYYY"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="payment_method"
            label="Metode Pembayaran"
            rules={[
              { required: true, message: "Pilih metode pembayaran" },
            ]}
          >
            <Select
              placeholder="Pilih metode pembayaran"
              disabled={loading}
              options={[
                { label: "Cash", value: "CASH" },
                { label: "Transfer", value: "TRANSFER" },
                { label: "QRIS", value: "QRIS" },
              ]}
            />
          </Form.Item>

          <Form.Item name="reference_number" label="Nomor Referensi">
            <Input
              maxLength={100}
              placeholder="Opsional"
              disabled={loading}
            />
          </Form.Item>

          <Form.Item
            name="proof_file"
            label="Bukti Pembayaran"
            valuePropName="value"
          >
            <PaymentProofUpload disabled={loading} />
          </Form.Item>

          <Form.Item name="notes" label="Catatan">
            <Input.TextArea
              rows={3}
              maxLength={500}
              showCount
              placeholder="Catatan pembayaran (opsional)"
              disabled={loading}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
