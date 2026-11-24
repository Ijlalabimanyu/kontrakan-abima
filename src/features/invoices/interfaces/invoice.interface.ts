export type InvoiceStatus = "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED";

export type InvoiceDisplayStatus = InvoiceStatus | "OVERDUE";

export interface InvoiceModel {
  id: string;
  owner_id: string;
  contract_id: string;
  invoice_number: string;
  billing_period: string;
  amount: number;
  due_date: string;
  status: InvoiceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;

  tenant_name: string;
  tenant_phone: string;
  room_number: string;
  property_name: string;

  display_status: InvoiceDisplayStatus;
}

export interface InvoiceFilterValues {
  search: string;
  status: InvoiceDisplayStatus | null;
  billing_period: string | null;
}

export interface GenerateInvoiceValues {
  billing_period: string;
}
