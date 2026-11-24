import { createClient } from "@/lib/supabase/server";
import { RoomModel } from "../interfaces/room.interfaces";

function getJakartaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

export async function getRooms(): Promise<RoomModel[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const today = getJakartaDate();

  const [roomsResult, propertiesResult, contractsResult] = await Promise.all([
    supabase
      .from("rooms")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),

    supabase.from("properties").select("id, name").eq("owner_id", user.id),

    supabase
      .from("rental_contracts")
      .select("room_id")
      .eq("owner_id", user.id)
      .eq("status", "ACTIVE")
      .lte("start_date", today)
      .or(`end_date.is.null,end_date.gte.${today}`),
  ]);

  if (roomsResult.error) {
    throw new Error(roomsResult.error.message);
  }

  if (propertiesResult.error) {
    throw new Error(propertiesResult.error.message);
  }

  if (contractsResult.error) {
    throw new Error(contractsResult.error.message);
  }

  const occupiedRoomIds = new Set(
    (contractsResult.data ?? []).map((contract) => contract.room_id),
  );

  const propertyMap = new Map(
    (propertiesResult.data ?? []).map((property) => [
      property.id,
      property.name,
    ]),
  );

  return (roomsResult.data ?? []).map((room) => {
    const effectiveStatus: RoomModel["status"] =
      room.status === "MAINTENANCE"
        ? "MAINTENANCE"
        : occupiedRoomIds.has(room.id)
          ? "OCCUPIED"
          : "AVAILABLE";

    return {
      ...room,
      status: effectiveStatus,
      property_name: propertyMap.get(room.property_id) ?? "-",
    };
  }) as RoomModel[];
}
