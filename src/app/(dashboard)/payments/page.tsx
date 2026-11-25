import PaymentTable from "@/features/payments/PaymentTable";
import {
  getPayableInvoices,
  getPayments,
} from "@/services/payments/payment.service";

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
