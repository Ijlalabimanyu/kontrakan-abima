"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Descriptions,
  Empty,
  List,
  Modal,
  Spin,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";

import {
  getInvoicePaymentHistoryAction,
  getPaymentProofUrl,
} from "@/services/payments/actions";
import { PaymentModel } from "@/services/payments/payment.interface";
import PaymentMethodBadge from "./PaymentMethodBadge";

interface PaymentDetailModalProps {
  open: boolean;
  payment: PaymentModel | null;
  onClose: () => void;
}

interface PaymentHistoryItem {
  id: string;
  payment_number: string;
  amount: number;
  payment_date: string;
  payment_method: "CASH" | "TRANSFER" | "QRIS";
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function PaymentDetailModal({
  open,
  payment,
  onClose,
}: PaymentDetailModalProps) {
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!open || !payment) return;

    let cancelled = false;

    const loadDetails = async () => {
      setLoading(true);
      setHistory([]);
      setProofUrl(null);

      try {
        const historyResult = await getInvoicePaymentHistoryAction(
          payment.invoice_id,
        );

        if (!historyResult.success) {
          throw new Error(historyResult.message);
        }

        if (!cancelled) {
          setHistory(historyResult.data);
        }

        if (payment.proof_path) {
          const proofResult = await getPaymentProofUrl(payment.proof_path);

          if (!proofResult.success) {
            throw new Error(proofResult.message);
          }

          if (!cancelled) {
            setProofUrl(proofResult.url);
          }
        }
      } catch (error) {
        if (!cancelled) {
          messageApi.error(
            error instanceof Error
              ? error.message
              : "Gagal mengambil detail pembayaran.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDetails();

    return () => {
      cancelled = true;
    };
  }, [open, payment, messageApi]);

  if (!payment) return null;

  return (
    <>
      {contextHolder}

      <Modal
        title="Detail Pembayaran"
        open={open}
        onCancel={onClose}
        footer={null}
        width={650}
        destroyOnHidden
      >
        <Spin spinning={loading}>
          <div className="space-y-5">
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Nomor Pembayaran">
                {payment.payment_number}
              </Descriptions.Item>
              <Descriptions.Item label="Nomor Invoice">
                {payment.invoice_number}
              </Descriptions.Item>
              <Descriptions.Item label="Penyewa">
                {payment.tenant_name}
              </Descriptions.Item>
              <Descriptions.Item label="Properti / Kamar">
                {payment.property_name} / {payment.room_number}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Pembayaran">
                {dayjs(payment.payment_date).format("DD MMMM YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Metode">
                <PaymentMethodBadge method={payment.payment_method} />
              </Descriptions.Item>
              <Descriptions.Item label="Nominal">
                <strong>{formatCurrency(payment.amount)}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Nomor Referensi">
                {payment.reference_number || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Catatan">
                {payment.notes || "-"}
              </Descriptions.Item>
            </Descriptions>

            <div className="space-y-2">
              <Typography.Text strong>Bukti Pembayaran</Typography.Text>
              {proofUrl ? (
                <div>
                  <Button
                    type="link"
                    href={proofUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Lihat Bukti Pembayaran
                  </Button>
                </div>
              ) : (
                <div>
                  <Typography.Text type="secondary">
                    {payment.proof_path
                      ? loading
                        ? "Memuat bukti pembayaran..."
                        : "Bukti pembayaran tidak dapat dimuat."
                      : "Tidak ada bukti pembayaran."}
                  </Typography.Text>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Typography.Text strong>
                Riwayat Pembayaran Invoice
              </Typography.Text>
              <List
                bordered
                dataSource={history}
                locale={{
                  emptyText: (
                    <Empty description="Belum ada riwayat pembayaran" />
                  ),
                }}
                renderItem={(item) => (
                  <List.Item>
                    <div className="flex w-full justify-between gap-3">
                      <div>
                        <div className="font-medium">{item.payment_number}</div>
                        <Typography.Text type="secondary">
                          {dayjs(item.payment_date).format("DD MMM YYYY")}
                        </Typography.Text>
                        <div className="mt-1">
                          <PaymentMethodBadge method={item.payment_method} />
                        </div>
                      </div>
                      <strong>{formatCurrency(item.amount)}</strong>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Spin>
      </Modal>
    </>
  );
}
