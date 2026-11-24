"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { roomSchema } from "@/features/rooms/schemas/room.schema";

export interface RoomActionState {
  success: boolean;
  message: string;
}

const initialState: RoomActionState = {
  success: false,
  message: "",
};

function getJakartaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

async function validatePropertyOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
  ownerId: string,
) {
  const { data, error } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("owner_id", ownerId)
    .maybeSingle();

  return !error && !!data;
}

function validateRoomData(formData: FormData) {
  return roomSchema.safeParse({
    property_id: formData.get("property_id"),
    room_number: formData.get("room_number"),
    monthly_price: formData.get("monthly_price"),
    status: formData.get("status"),
    description: formData.get("description") ?? "",
  });
}

export async function createRoom(
  _prevState: RoomActionState,
  formData: FormData,
): Promise<RoomActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { ...initialState, message: "Unauthorized" };
  }

  const parsed = validateRoomData(formData);

  if (!parsed.success) {
    return {
      ...initialState,
      message: parsed.error.issues[0]?.message ?? "Data tidak valid",
    };
  }

  const isOwner = await validatePropertyOwnership(
    supabase,
    parsed.data.property_id,
    user.id,
  );

  if (!isOwner) {
    return {
      ...initialState,
      message: "Properti tidak ditemukan",
    };
  }

  const { error } = await supabase.from("rooms").insert({
    property_id: parsed.data.property_id,
    owner_id: user.id,
    room_number: parsed.data.room_number,
    monthly_price: Number(parsed.data.monthly_price),
    status: parsed.data.status,
    description: parsed.data.description || null,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ...initialState,
        message: "Nomor kamar sudah digunakan pada properti ini",
      };
    }

    return {
      ...initialState,
      message: error.message,
    };
  }

  revalidatePath("/rooms");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Kamar berhasil ditambahkan",
  };
}

export async function updateRoom(
  _prevState: RoomActionState,
  formData: FormData,
): Promise<RoomActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { ...initialState, message: "Unauthorized" };
  }

  const roomId = String(formData.get("id") ?? "");
  const parsed = validateRoomData(formData);

  if (!roomId || !parsed.success) {
    return {
      ...initialState,
      message: parsed.success
        ? "ID kamar tidak valid"
        : (parsed.error.issues[0]?.message ?? "Data tidak valid"),
    };
  }

  const isOwner = await validatePropertyOwnership(
    supabase,
    parsed.data.property_id,
    user.id,
  );

  if (!isOwner) {
    return {
      ...initialState,
      message: "Properti tidak ditemukan",
    };
  }

  // Check current room status.
  const { data: existingRoom, error: findError } = await supabase
    .from("rooms")
    .select("id, status")
    .eq("id", roomId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (findError || !existingRoom) {
    return {
      ...initialState,
      message: "Kamar tidak ditemukan",
    };
  }

  const today = getJakartaDate();
  const { data: currentContracts, error: contractError } = await supabase
    .from("rental_contracts")
    .select("room_id")
    .eq("room_id", roomId)
    .eq("owner_id", user.id)
    .eq("status", "ACTIVE")
    .lte("start_date", today)
    .or(`end_date.is.null,end_date.gte.${today}`);

  if (contractError) {
    return {
      ...initialState,
      message: contractError.message,
    };
  }

  const isCurrentlyOccupied =
    existingRoom.status === "OCCUPIED" || (currentContracts?.length ?? 0) > 0;

  const updateData = {
    property_id: parsed.data.property_id,
    room_number: parsed.data.room_number,
    monthly_price: Number(parsed.data.monthly_price),
    description: parsed.data.description || null,
    updated_at: new Date().toISOString(),
    ...(isCurrentlyOccupied ? {} : { status: parsed.data.status }),
  };

  const { error } = await supabase
    .from("rooms")
    .update(updateData)
    .eq("id", roomId)
    .eq("owner_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return {
        ...initialState,
        message: "Nomor kamar sudah digunakan pada properti ini",
      };
    }

    return {
      ...initialState,
      message: error.message,
    };
  }

  revalidatePath("/rooms");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Kamar berhasil diperbarui",
  };
}

export async function deleteRoom(roomId: string): Promise<RoomActionState> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { ...initialState, message: "Unauthorized" };
  }

  if (!roomId) {
    return {
      ...initialState,
      message: "ID kamar tidak valid",
    };
  }

  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("id", roomId)
    .eq("owner_id", user.id);

  if (error) {
    return {
      ...initialState,
      message: "Kamar tidak dapat dihapus karena masih memiliki relasi data.",
    };
  }

  revalidatePath("/rooms");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Kamar berhasil dihapus",
  };
}
