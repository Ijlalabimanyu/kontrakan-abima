export interface PropertyModel {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyFormValues {
  name: string;
  address: string;
  description: string;
}
