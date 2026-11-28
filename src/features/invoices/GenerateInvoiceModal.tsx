"use client";

import { useState } from "react";
import { Alert, Form, message } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

import { Button, DatePicker, Modal } from "@/components/ui";

import { generateInvoices } from "@/services/invoices/actions";
import type { GenerateInvoiceValues } from "@/services/invoices/interface";

interface GenerateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
}

interface GenerateInvoiceFormValues {
  billing_period: Dayjs;
}

interface GenerateInvoiceResult {
  createdCount: number;
  skippedCount: number;
}

export default function GenerateInvoiceModal({
  open,
  onClose,
}: GenerateInvoiceModalProps) {
  const [form] = Form.useForm<GenerateInvoiceFormValues>();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateInvoiceResult | null>(null);

  const handleClose = () => {
    if (loading) return;

    form.resetFields();
    setResult(null);
    onClose();
  };

  const handleSubmit = async (values: GenerateInvoiceFormValues) => {
    setLoading(true);
    setResult(null);

    try {
      const payload: GenerateInvoiceValues = {
        billing_period: values.billing_period.format("YYYY-MM"),
      };

      const response = await generateInvoices(payload);

      if (!response.success) {
        messageApi.error(response.message);
        return;
      }

      setResult({
        createdCount: response.createdCount ?? 0,
        skippedCount: response.skippedCount ?? 0,
      });

      messageApi.success(response.message);
      router.refresh();
    } catch (error) {
      console.error("Generate invoice error:", error);
      messageApi.error("Gagal membuat invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <Modal
        open={open}
        title={
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">
              Generate Invoice
            </h2>

            <p className="text-xs font-normal text-muted">
              Buat invoice tagihan berdasarkan periode kontrak sewa.
            </p>
          </div>
        }
        width="min(520px, calc(100vw - 32px))"
        centered
        footer={null}
        destroyOnHidden
        closable
        onCancel={handleClose}
        styles={{
          body: {
            maxHeight: "calc(100dvh - 180px)",
            overflowY: "auto",
            paddingTop: 20,
          },
        }}
      >
        {open && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted">
              Pilih periode tagihan untuk membuat invoice berdasarkan kontrak
              sewa yang memenuhi periode tersebut.
            </p>

            <Form<GenerateInvoiceFormValues>
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ billing_period: dayjs() }}
              requiredMark="optional"
              disabled={loading}
            >
              <Form.Item
                label="Periode Tagihan"
                name="billing_period"
                rules={[
                  {
                    required: true,
                    message: "Pilih periode tagihan.",
                  },
                ]}
              >
                <DatePicker
                  picker="month"
                  format="MMMM YYYY"
                  className="w-full!"
                  placeholder="Pilih bulan dan tahun"
                  disabled={loading || !!result}
                />
              </Form.Item>
            </Form>

            {/* Generate Result */}
            {result && (
              <Alert
                type="success"
                showIcon
                message="Generate invoice selesai"
                description={
                  <div className="space-y-1">
                    <p>
                      Invoice berhasil dibuat:{" "}
                      <strong>{result.createdCount}</strong>
                    </p>

                    <p>
                      Invoice dilewati: <strong>{result.skippedCount}</strong>
                    </p>
                  </div>
                }
              />
            )}

            {/* Form Actions */}
            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                block
                className="sm:w-auto!"
                onClick={handleClose}
                disabled={loading}
              >
                Tutup
              </Button>

              <Button
                variant="primary"
                block
                className="sm:w-auto!"
                onClick={() => form.submit()}
                loading={loading}
                disabled={loading || !!result}
              >
                Generate Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
