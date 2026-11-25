export type ContractStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export type RoomAvailabilityStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export interface ContractModel {
  id: string;
  room_id: string;
  tenant_id: string;
  owner_id: string;
  start_date: string;
  end_date: string | null;
  monthly_price: number;
  payment_due_day: number;
  status: ContractStatus;
  created_at: string;

  room_number: string;
  tenant_name: string;
  tenant_phone: string | null;
  property_name: string;
}

export interface ContractFormValues {
  room_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_price: number;
  payment_due_day: number;
}

export interface ContractFilterValues {
  search: string;
  status: ContractStatus | null;
}

export interface ContractRoomOption {
  id: string;
  room_number: string;
  property_name: string;
  monthly_price: number;
  status: RoomAvailabilityStatus;
  hasActiveContract: boolean;
}

export interface ContractTenantOption {
  id: string;
  name: string;
  phone: string | null;
}
