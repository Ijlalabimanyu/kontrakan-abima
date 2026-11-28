import { Suspense } from "react";
import { connection } from "next/server";
import InvoiceTable from "@/features/invoices/InvoiceTable";
import { getInvoices } from "@/services/invoices/service";
import InvoicesLoading from "@/features/invoices/InvoiceLoading";

async function InvoicesContent() {
  await connection();

  const invoices = await getInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manajemen Invoice
        </h1>

        <p className="mt-1 text-sm text-muted">
          Kelola tagihan sewa, pantau status pembayaran, dan riwayat invoice
          kontrakan.
        </p>
      </div>

      <InvoiceTable invoices={invoices} />
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<InvoicesLoading />}>
      <InvoicesContent />
    </Suspense>
  );
}
