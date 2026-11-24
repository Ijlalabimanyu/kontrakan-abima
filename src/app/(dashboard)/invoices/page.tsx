import InvoiceTable from "@/features/invoices/components/InvoiceTable";
import { getInvoices } from "@/features/invoices/services/invoice.service";

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="space-y-6">
      <InvoiceTable invoices={invoices} />
    </div>
  );
}
