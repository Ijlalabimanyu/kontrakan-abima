import PaymentTable from "@/features/payments/components/PaymentTable";
import {
  getPayableInvoices,
  getPayments,
} from "@/features/payments/services/payment.service";

export default async function PaymentsPage() {
  const [payments, payableInvoices] = await Promise.all([
    getPayments(),
    getPayableInvoices(),
  ]);

  return (
    <div className="space-y-6">
      <PaymentTable payments={payments} payableInvoices={payableInvoices} />
    </div>
  );
}
