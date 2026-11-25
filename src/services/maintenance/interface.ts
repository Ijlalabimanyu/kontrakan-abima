export type MaintenanceCategory =
  | "ELECTRICAL"
  | "PLUMBING"
  | "AC"
  | "FURNITURE"
  | "BUILDING"
  | "INTERNET"
  | "OTHER";

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type MaintenanceStatus =
  "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type MaintenancePaymentMethod = "CASH" | "TRANSFER" | "QRIS";

export interface MaintenanceModel {
  id: string;
  owner_id: string;
  property_id: string | null;
  room_id: string | null;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reported_at: string;
  scheduled_date: string | null;
  completed_at: string | null;
  completion_notes: string | null;
  cost_amount: number;
  cost_description: string | null;
  expense_date: string | null;
  payment_method: MaintenancePaymentMethod | null;
  reference_number: string | null;
  expense_id: string | null;
  created_at: string;
  updated_at: string;
  property_name: string;
  room_number: string | null;
}

export interface MaintenanceFormValues {
  property_id: string;
  room_id: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  scheduled_date: string | null;
}

export interface CompleteMaintenanceValues {
  completion_notes: string;
  cost_amount: number;
  cost_description: string;
  expense_date: string | null;
  payment_method: MaintenancePaymentMethod | null;
  reference_number: string;
}

export interface MaintenanceFilterValues {
  search: string;
  status: MaintenanceStatus | null;
  category: MaintenanceCategory | null;
  priority: MaintenancePriority | null;
  property_id: string | null;
}

export interface MaintenancePropertyOption {
  id: string;
  name: string;
}

export interface MaintenanceRoomOption {
  id: string;
  room_number: string;
  property_id: string;
}
