import { Suspense } from "react";
import { connection } from "next/server";

import { getProperties } from "@/services/properties/property.service";
import { getRooms } from "@/services/rooms/service";
import RoomTable from "@/features/rooms/RoomTable";

async function RoomsContent() {
  await connection();

  const [rooms, properties] = await Promise.all([getRooms(), getProperties()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Manajemen Kamar</h1>

        <p className="text-sm text-slate-500">
          Kelola kamar, harga sewa, dan ketersediaan kamar kontrakan.
        </p>
      </div>

      <RoomTable rooms={rooms} properties={properties} />
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={null}>
      <RoomsContent />
    </Suspense>
  );
}
