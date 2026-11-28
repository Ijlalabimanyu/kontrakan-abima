import { Suspense } from "react";
import { connection } from "next/server";
import { getTenants } from "@/services/tenants/service";
import TenantTable from "@/features/tenants/TenantTable";
import TenantsLoading from "@/features/tenants/TenantLoading";

async function TenantsContent() {
  await connection();

  const tenants = await getTenants();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mt-1 text-2xl font-bold text-foreground">
          Manajemen Penyewa
        </h1>

        <p className="mt-1 text-sm text-muted">
          Kelola informasi dan data penyewa kontrakan Anda.
        </p>
      </div>

      <TenantTable tenants={tenants} />
    </div>
  );
}

export default function TenantsPage() {
  return (
    <Suspense fallback={<TenantsLoading />}>
      <TenantsContent />
    </Suspense>
  );
}
