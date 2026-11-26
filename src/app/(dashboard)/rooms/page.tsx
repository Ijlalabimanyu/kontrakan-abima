import { Suspense } from "react";
import { connection } from "next/server";

import { getProperties } from "@/services/properties/service";
import { getRooms } from "@/services/rooms/service";

import RoomTable from "@/features/rooms/RoomTable";
import RoomsLoading from "@/features/rooms/RoomsLoading";

async function RoomsContent() {
  await connection();

  const [rooms, properties] = await Promise.all([getRooms(), getProperties()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manajemen Kamar</h1>

        <p className="mt-1 text-sm text-muted">
          Kelola kamar, harga sewa, dan ketersediaan kamar kontrakan.
        </p>
      </div>

      <RoomTable rooms={rooms} properties={properties} />
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<RoomsLoading />}>
      <RoomsContent />
    </Suspense>
  );
}
