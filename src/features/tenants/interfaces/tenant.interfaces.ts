export interface TenantModel {
  id: string;
  owner_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  identity_number: string | null;
  address: string | null;
  created_at: string;
}

export interface TenantFormValues {
  name: string;
  phone: string;
  email: string;
  identity_number: string;
  address: string;
}

export interface TenantFilterValues {
  search: string;
}
