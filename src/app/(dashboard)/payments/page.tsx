import { Suspense } from "react";
import { connection } from "next/server";
import PaymentTable from "@/features/payments/PaymentTable";
import PaymentsLoading from "@/features/payments/PaymentLoading";
import { getPayableInvoices, getPayments } from "@/services/payments/service";

async function PaymentsContent() {
  await connection();

  const [payments, payableInvoices] = await Promise.all([
    getPayments(),
    getPayableInvoices(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manajemen Pembayaran
        </h1>
        <p className="mt-1 text-sm text-muted">
          Kelola pembayaran sewa, pantau status transaksi, dan riwayat
          pembayaran penyewa.
        </p>
      </div>

      <PaymentTable payments={payments} payableInvoices={payableInvoices} />
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<PaymentsLoading />}>
      <PaymentsContent />
    </Suspense>
  );
}
