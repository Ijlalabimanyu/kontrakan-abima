"use client";

import { useState } from "react";
import { Alert, DatePicker, Form, Modal, Typography, message } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useRouter } from "next/navigation";

import { generateInvoices } from "@/services/invoices/actions";
import { GenerateInvoiceValues } from "../interfaces/invoice.interface";

interface GenerateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
}

interface GenerateInvoiceFormValues {
  billing_period: Dayjs;
}

export default function GenerateInvoiceModal({
  open,
  onClose,
}: GenerateInvoiceModalProps) {
  const [form] = Form.useForm<GenerateInvoiceFormValues>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    createdCount: number;
    skippedCount: number;
  } | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

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
        title="Generate Invoice"
        open={open}
        onCancel={handleClose}
        onOk={() => form.submit()}
        okText="Generate Invoice"
        cancelText="Tutup"
        confirmLoading={loading}
        closable={!loading}
        maskClosable={!loading}
        okButtonProps={{ disabled: loading || !!result }}
        destroyOnHidden
      >
        <div className="space-y-4">
          <Typography.Text type="secondary">
            Pilih periode tagihan untuk membuat invoice berdasarkan kontrak
            sewa yang tersedia.
          </Typography.Text>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ billing_period: dayjs() }}
          >
            <Form.Item
              label="Periode Tagihan"
              name="billing_period"
              rules={[{ required: true, message: "Pilih periode tagihan" }]}
            >
              <DatePicker
                picker="month"
                format="MMMM YYYY"
                className="w-full"
                placeholder="Pilih bulan dan tahun"
                disabled={loading || !!result}
              />
            </Form.Item>
          </Form>

          {result && (
            <Alert
              type="success"
              showIcon
              message="Generate invoice selesai"
              description={
                <div className="space-y-1">
                  <div>
                    Invoice berhasil dibuat: <strong>{result.createdCount}</strong>
                  </div>
                  <div>
                    Invoice dilewati: <strong>{result.skippedCount}</strong>
                  </div>
                </div>
              }
            />
          )}
        </div>
      </Modal>
    </>
  );
}
