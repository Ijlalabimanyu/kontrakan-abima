export type PaymentMethod = "CASH" | "TRANSFER" | "QRIS";

export interface PaymentModel {
  id: string;
  owner_id: string;
  invoice_id: string;
  payment_number: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number: string | null;
  proof_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;

  invoice_number: string;
  invoice_amount: number;
  billing_period: string;
  invoice_status: string;

  tenant_name: string;
  tenant_phone: string;
  room_number: string;
  property_name: string;
}

export interface PaymentInvoiceOption {
  id: string;
  invoice_number: string;
  tenant_name: string;
  room_number: string;
  billing_period: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
}

export interface PaymentFilterValues {
  search: string;
  payment_method: PaymentMethod | null;
  payment_date: string | null;
}

export interface PaymentFormValues {
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  notes?: string;
}
