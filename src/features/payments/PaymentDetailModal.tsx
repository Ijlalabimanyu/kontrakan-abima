"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button as AntButton,
  Descriptions,
  Empty,
  List,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { Button, Modal } from "@/components/ui";
import {
  getInvoicePaymentHistoryAction,
  getPaymentProofUrl,
} from "@/services/payments/actions";
import type { PaymentModel } from "@/services/payments/interface";
import PaymentMethodBadge from "./PaymentMethodBadge";
import { CurrencyFormatter } from "@/lib/utils";

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

export default function PaymentDetailModal({
  open,
  payment,
  onClose,
}: PaymentDetailModalProps) {
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !payment) return;

    let cancelled = false;

    const loadDetails = async () => {
      setLoading(true);
      setHistory([]);
      setProofUrl(null);
      setHistoryError(null);
      setProofError(null);

      const historyTask = getInvoicePaymentHistoryAction(payment.invoice_id);

      const proofTask = payment.proof_path
        ? getPaymentProofUrl(payment.proof_path)
        : Promise.resolve(null);

      const [historyResult, proofResult] = await Promise.allSettled([
        historyTask,
        proofTask,
      ]);

      if (cancelled) return;

      if (historyResult.status === "fulfilled") {
        if (historyResult.value.success) {
          setHistory(historyResult.value.data);
        } else {
          setHistoryError(historyResult.value.message);
        }
      } else {
        setHistoryError("Gagal mengambil riwayat pembayaran.");
      }

      if (proofResult.status === "fulfilled") {
        if (proofResult.value === null) {
          setProofUrl(null);
        } else if (proofResult.value.success) {
          setProofUrl(proofResult.value.url);
        } else {
          setProofError(proofResult.value.message);
        }
      } else {
        setProofError("Gagal membuka bukti pembayaran.");
      }

      setLoading(false);
    };

    void loadDetails();

    return () => {
      cancelled = true;
    };
  }, [open, payment]);

  if (!payment) return null;

  return (
    <Modal
      title="Detail Pembayaran"
      open={open}
      onCancel={onClose}
      width={600}
      footer={null}
    >
      <Spin spinning={loading}>
        <div className="space-y-4">
          {/* Nomor Pembayaran */}
          <div>
            <p className="text-xs text-[#68756D]">Nomor Pembayaran</p>
            <p className="mt-1 break-all text-base font-semibold text-[#173F35]">
              {payment.payment_number}
            </p>
          </div>

          {/* Informasi Pembayaran */}
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Nomor Invoice">
              {payment.invoice_number}
            </Descriptions.Item>

            <Descriptions.Item label="Penyewa">
              {payment.tenant_name}
            </Descriptions.Item>

            <Descriptions.Item label="Nomor Telepon">
              {payment.tenant_phone || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Properti / Kamar">
              {payment.property_name} / {payment.room_number}
            </Descriptions.Item>

            <Descriptions.Item label="Tanggal Pembayaran">
              {dayjs(payment.payment_date).format("DD MMMM YYYY")}
            </Descriptions.Item>

            <Descriptions.Item label="Metode Pembayaran">
              <PaymentMethodBadge method={payment.payment_method} />
            </Descriptions.Item>

            <Descriptions.Item label="Nominal">
              <span className="font-semibold text-[#173F35]">
                {CurrencyFormatter.format(payment.amount)}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label="Nomor Referensi">
              {payment.reference_number || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Catatan">
              {payment.notes || "-"}
            </Descriptions.Item>
          </Descriptions>

          {/* Bukti Pembayaran */}
          <div className="space-y-2 pt-4">
            <p className="text-sm font-medium text-[#202C26]">
              Bukti Pembayaran
            </p>

            {proofUrl ? (
              <AntButton
                type="link"
                href={proofUrl}
                target="_blank"
                rel="noreferrer"
                className="px-0!"
              >
                Lihat Bukti Pembayaran
              </AntButton>
            ) : proofError ? (
              <Alert type="warning" showIcon message={proofError} />
            ) : (
              <Typography.Text type="secondary">
                {payment.proof_path
                  ? "Memuat bukti pembayaran..."
                  : "Tidak ada bukti pembayaran."}
              </Typography.Text>
            )}
          </div>

          {/* Riwayat Pembayaran */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#202C26]">
              Riwayat Pembayaran Invoice
            </p>

            {historyError ? (
              <Alert type="error" showIcon message={historyError} />
            ) : (
              <List
                bordered
                dataSource={history}
                locale={{
                  emptyText: (
                    <Empty description="Belum ada riwayat pembayaran" />
                  ),
                }}
                renderItem={(item) => (
                  <List.Item className="px-4!">
                    <div className="flex w-full items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all font-medium text-[#202C26]">
                          {item.payment_number}
                        </p>

                        <p className="mt-1 text-xs text-[#68756D]">
                          {dayjs(item.payment_date).format("DD MMM YYYY")}
                        </p>

                        <div className="mt-2">
                          <PaymentMethodBadge method={item.payment_method} />
                        </div>
                      </div>

                      <strong className="shrink-0 text-sm text-[#173F35]">
                        {CurrencyFormatter.format(item.amount)}
                      </strong>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>

          {/* Action */}
          <div className="mt-5 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </Spin>
    </Modal>
  );
}
