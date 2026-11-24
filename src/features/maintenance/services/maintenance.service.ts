import { createClient } from "@/lib/supabase/server";

import type {
  MaintenanceFilterValues,
  MaintenanceModel,
  MaintenancePropertyOption,
  MaintenanceRoomOption,
} from "../interfaces/maintenance.interface";

export async function getMaintenances(
  filters?: Partial<MaintenanceFilterValues>,
): Promise<MaintenanceModel[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Sesi pengguna tidak valid");
  }

  let query = supabase
    .from("maintenance_requests")
    .select("*")
    .eq("owner_id", user.id)
    .order("reported_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.priority) query = query.eq("priority", filters.priority);
  if (filters?.property_id) {
    query = query.eq("property_id", filters.property_id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const maintenanceRows = data ?? [];
  const search = filters?.search?.trim().toLowerCase();
  const filteredRows = search
    ? maintenanceRows.filter((item) =>
        [item.title, item.description].some((value) =>
          value?.toLowerCase().includes(search),
        ),
      )
    : maintenanceRows;

  if (filteredRows.length === 0) return [];

  const propertyIds = [
    ...new Set(
      filteredRows
        .map((item) => item.property_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const roomIds = [
    ...new Set(
      filteredRows
        .map((item) => item.room_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const [propertiesResult, roomsResult] = await Promise.all([
    propertyIds.length
      ? supabase
          .from("properties")
          .select("id, name")
          .eq("owner_id", user.id)
          .in("id", propertyIds)
      : Promise.resolve({ data: [], error: null }),
    roomIds.length
      ? supabase
          .from("rooms")
          .select("id, room_number")
          .eq("owner_id", user.id)
          .in("id", roomIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (propertiesResult.error) throw new Error(propertiesResult.error.message);
  if (roomsResult.error) throw new Error(roomsResult.error.message);

  const propertyMap = new Map(
    (propertiesResult.data ?? []).map((item) => [item.id, item.name]),
  );
  const roomMap = new Map(
    (roomsResult.data ?? []).map((item) => [item.id, item.room_number]),
  );

  return filteredRows.map((item) => ({
    ...item,
    cost_amount: Number(item.cost_amount),
    property_name: item.property_id
      ? (propertyMap.get(item.property_id) ?? "-")
      : "-",
    room_number: item.room_id ? (roomMap.get(item.room_id) ?? null) : null,
  })) as MaintenanceModel[];
}

export async function getMaintenanceById(
  id: string,
): Promise<MaintenanceModel | null> {
  const maintenances = await getMaintenances();
  return maintenances.find((item) => item.id === id) ?? null;
}

export async function getMaintenancePropertyOptions(): Promise<
  MaintenancePropertyOption[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("properties")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");
  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function getMaintenanceRoomOptions(
  propertyId?: string,
): Promise<MaintenanceRoomOption[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("rooms")
    .select("id, room_number, property_id")
    .eq("owner_id", user.id)
    .order("room_number");
  if (propertyId) query = query.eq("property_id", propertyId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data ?? [];
}
