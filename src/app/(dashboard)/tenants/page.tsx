import { getTenants } from "@/features/tenants/services/tenant.service";
import TenantTable from "@/features/tenants/components/TenantTable";

export default async function TenantsPage() {
  const tenants = await getTenants();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Manajemen Penyewa</h1>

        <p className="text-sm text-slate-500">
          Kelola informasi dan data penyewa kontrakan Anda.
        </p>
      </div>

      <TenantTable tenants={tenants} />
    </div>
  );
}
