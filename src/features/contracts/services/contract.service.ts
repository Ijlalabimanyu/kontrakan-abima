import { createClient } from "@/lib/supabase/server";
import {
  ContractModel,
  ContractRoomOption,
  ContractTenantOption,
} from "../interfaces/contract.interface";

function getJakartaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

export async function getContracts(): Promise<ContractModel[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const [contractsResult, roomsResult, tenantsResult, propertiesResult] =
    await Promise.all([
      supabase
        .from("rental_contracts")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("rooms")
        .select("id, room_number, property_id")
        .eq("owner_id", user.id),

      supabase
        .from("tenants")
        .select("id, name, phone")
        .eq("owner_id", user.id),

      supabase.from("properties").select("id, name").eq("owner_id", user.id),
    ]);

  if (contractsResult.error) throw new Error(contractsResult.error.message);
  if (roomsResult.error) throw new Error(roomsResult.error.message);
  if (tenantsResult.error) throw new Error(tenantsResult.error.message);
  if (propertiesResult.error) throw new Error(propertiesResult.error.message);

  const roomMap = new Map(roomsResult.data.map((item) => [item.id, item]));

  const tenantMap = new Map(tenantsResult.data.map((item) => [item.id, item]));

  const propertyMap = new Map(
    propertiesResult.data.map((item) => [item.id, item.name]),
  );

  return contractsResult.data.map((contract) => {
    const room = roomMap.get(contract.room_id);
    const tenant = tenantMap.get(contract.tenant_id);

    return {
      ...contract,
      room_number: room?.room_number ?? "-",
      tenant_name: tenant?.name ?? "-",
      tenant_phone: tenant?.phone ?? null,
      property_name: room ? (propertyMap.get(room.property_id) ?? "-") : "-",
    };
  }) as ContractModel[];
}

export async function getContractRooms(): Promise<ContractRoomOption[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const [roomsResult, propertiesResult, contractsResult] = await Promise.all([
    supabase
      .from("rooms")
      .select("id, room_number, property_id, monthly_price, status")
      .eq("owner_id", user.id),

    supabase.from("properties").select("id, name").eq("owner_id", user.id),

    supabase
      .from("rental_contracts")
      .select("room_id, start_date, end_date")
      .eq("owner_id", user.id)
      .eq("status", "ACTIVE"),
  ]);

  if (roomsResult.error) throw new Error(roomsResult.error.message);
  if (propertiesResult.error) throw new Error(propertiesResult.error.message);
  if (contractsResult.error) throw new Error(contractsResult.error.message);

  const activeRoomIds = new Set(
    contractsResult.data.map((contract) => contract.room_id),
  );

  const today = getJakartaDate();
  const occupiedRoomIds = new Set(
    contractsResult.data
      .filter(
        (contract) =>
          contract.start_date <= today &&
          (!contract.end_date || contract.end_date >= today),
      )
      .map((contract) => contract.room_id),
  );

  const propertyMap = new Map(
    propertiesResult.data.map((property) => [property.id, property.name]),
  );

  return roomsResult.data.map((room) => ({
    id: room.id,
    room_number: room.room_number,
    property_name: propertyMap.get(room.property_id) ?? "-",
    monthly_price: Number(room.monthly_price),
    status:
      room.status === "MAINTENANCE"
        ? "MAINTENANCE"
        : occupiedRoomIds.has(room.id)
          ? "OCCUPIED"
          : "AVAILABLE",
    hasActiveContract: activeRoomIds.has(room.id),
  })) as ContractRoomOption[];
}

export async function getContractTenants(): Promise<ContractTenantOption[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("tenants")
    .select("id, name, phone")
    .eq("owner_id", user.id)
    .order("name");

  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function getRoomContractHistory(roomId: string) {
  const contracts = await getContracts();

  return contracts
    .filter((contract) => contract.room_id === roomId)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));
}

export async function getTenantContractHistory(tenantId: string) {
  const contracts = await getContracts();

  return contracts
    .filter((contract) => contract.tenant_id === tenantId)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));
}
