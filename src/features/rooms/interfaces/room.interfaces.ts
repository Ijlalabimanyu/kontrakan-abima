export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export type ManualRoomStatus = Exclude<RoomStatus, "OCCUPIED">;

export interface RoomModel {
  id: string;
  property_id: string;
  owner_id: string;
  room_number: string;
  monthly_price: number;
  status: RoomStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
  property_name: string;
}

export interface RoomFormValues {
  property_id: string;
  room_number: string;
  monthly_price: number;
  status: ManualRoomStatus;
  description: string;
}

export interface RoomFilterValues {
  search: string;
  property_id: string | null;
  status: RoomStatus | null;
}
