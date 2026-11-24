import { Suspense } from "react";
import { connection } from "next/server";

import { getProperties } from "@/features/properties/services/property.service";
import PropertyTable from "@/features/properties/components/PropertyTable";

async function PropertiesContent() {
  await connection();

  const properties = await getProperties();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Manajemen Properti</h1>

        <p className="text-sm text-slate-500">
          Kelola informasi properti kontrakan Anda.
        </p>
      </div>

      <PropertyTable properties={properties} />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <PropertiesContent />
    </Suspense>
  );
}
