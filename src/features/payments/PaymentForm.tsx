"use client";

import { useState } from "react";
import { Alert, Form, message } from "antd";
import type { UploadFile } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import {
  Button,
  DatePicker,
  Input,
  Modal,
  NumberInput,
  Select,
  TextArea,
} from "@/components/ui";
import { createPayment, uploadPaymentProof } from "@/services/payments/actions";
import type {
  PaymentFormValues,
  PaymentInvoiceOption,
  PaymentMethod,
} from "@/services/payments/interface";
import PaymentProofUpload from "./PaymentProofUpload";
import { CurrencyFormatter } from "@/lib/utils";

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

interface PaymentFormContentProps {
  invoices: PaymentInvoiceOption[];
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
}

function PaymentFormContent({
  invoices,
  loading,
  onLoadingChange,
  onClose,
  onSuccess,
}: PaymentFormContentProps) {
  const [form] = Form.useForm<FormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  const router = useRouter();

  const selectedInvoiceId = Form.useWatch("invoice_id", form);

  const selectedInvoice = invoices.find(
    (invoice) => invoice.id === selectedInvoiceId,
  );

  const handleSubmit = async (values: FormValues) => {
    onLoadingChange(true);

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
      onSuccess();
      router.refresh();
    } catch (error) {
      console.error("Submit payment error:", error);
      messageApi.error("Gagal mencatat pembayaran.");
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <>
      {contextHolder}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          payment_date: dayjs(),
          payment_method: "TRANSFER",
        }}
        onValuesChange={(changedValues) => {
          if (!("invoice_id" in changedValues)) return;

          const invoice = invoices.find(
            (item) => item.id === changedValues.invoice_id,
          );

          form.setFieldValue("amount", invoice?.remaining_amount ?? undefined);
        }}
        requiredMark="optional"
        disabled={loading}
        className="space-y-1"
      >
        <Form.Item
          name="invoice_id"
          label="Invoice"
          rules={[
            {
              required: true,
              message: "Pilih invoice terlebih dahulu",
            },
          ]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Pilih invoice"
            options={invoices.map((invoice) => ({
              value: invoice.id,
              label: `${invoice.invoice_number} - ${invoice.tenant_name} (Kamar ${invoice.room_number})`,
            }))}
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
                  <strong>
                    {CurrencyFormatter.format(selectedInvoice.amount)}
                  </strong>
                </div>

                <div>
                  Sudah dibayar:{" "}
                  <strong>
                    {CurrencyFormatter.format(selectedInvoice.paid_amount)}
                  </strong>
                </div>

                <div>
                  Sisa tagihan:{" "}
                  <strong>
                    {CurrencyFormatter.format(selectedInvoice.remaining_amount)}
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
            {
              required: true,
              message: "Masukkan nominal pembayaran",
            },
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
          <NumberInput
            className="w-full!"
            min={1}
            max={selectedInvoice?.remaining_amount}
            precision={2}
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
            {
              required: true,
              message: "Pilih tanggal pembayaran",
            },
          ]}
        >
          <DatePicker
            className="w-full!"
            format="DD MMMM YYYY"
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="payment_method"
          label="Metode Pembayaran"
          rules={[
            {
              required: true,
              message: "Pilih metode pembayaran",
            },
          ]}
        >
          <Select
            placeholder="Pilih metode pembayaran"
            options={[
              { label: "Cash", value: "CASH" },
              { label: "Transfer", value: "TRANSFER" },
              { label: "QRIS", value: "QRIS" },
            ]}
          />
        </Form.Item>

        <Form.Item name="reference_number" label="Nomor Referensi">
          <Input maxLength={100} placeholder="Opsional" />
        </Form.Item>

        <Form.Item
          name="proof_file"
          label="Bukti Pembayaran"
          valuePropName="value"
        >
          <PaymentProofUpload disabled={loading} />
        </Form.Item>

        <Form.Item name="notes" label="Catatan">
          <TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder="Catatan pembayaran (opsional)"
            disabled={loading}
          />
        </Form.Item>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            block
            className="sm:w-auto!"
          >
            Batal
          </Button>

          <Button
            variant="primary"
            onClick={() => form.submit()}
            loading={loading}
            disabled={!invoices.length}
            block
            className="sm:w-auto!"
          >
            Simpan Pembayaran
          </Button>
        </div>
      </Form>
    </>
  );
}

export default function PaymentForm({
  open,
  invoices,
  onClose,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSuccess = () => {
    onClose();
    router.refresh();
  };

  return (
    <Modal
      title={
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Catat Pembayaran
          </h2>
          <p className="text-sm font-normal text-muted">
            Catat transaksi pembayaran dan lengkapi bukti pembayaran penyewa.
          </p>
        </div>
      }
      open={open}
      onCancel={handleClose}
      width="min(560px, calc(100vw - 32px))"
      centered
      footer={null}
      destroyOnHidden
      closable={!loading}
      maskClosable={!loading}
      styles={{
        body: {
          maxHeight: "calc(100dvh - 180px)",
          overflowY: "auto",
          paddingTop: 20,
        },
      }}
    >
      {open && (
        <PaymentFormContent
          key="new-payment"
          invoices={invoices}
          loading={loading}
          onLoadingChange={setLoading}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      )}
    </Modal>
  );
}
