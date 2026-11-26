import { Suspense } from "react";
import { connection } from "next/server";

import { getProperties } from "@/services/properties/service";
import PropertyTable from "@/features/properties/PropertyTable";
import PropertiesLoading from "@/features/properties/PropertiesLoading";

async function PropertiesContent() {
  await connection();

  const properties = await getProperties();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Manajemen Properti
        </h1>

        <p className="mt-1 text-sm text-muted">
          Kelola informasi properti kontrakan Anda.
        </p>
      </div>

      <PropertyTable properties={properties} />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertiesLoading />}>
      <PropertiesContent />
    </Suspense>
  );
}
