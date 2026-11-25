import {
  getContracts,
  getContractRooms,
  getContractTenants,
} from "@/services/contract/service";
import ContractTable from "@/features/contracts/ContractTable";

export default async function ContractsPage() {
  const [contracts, rooms, tenants] = await Promise.all([
    getContracts(),
    getContractRooms(),
    getContractTenants(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Manajemen Kontrak</h1>

        <p className="text-sm text-slate-500">
          Kelola penyewaan kamar dan riwayat kontrak penyewa.
        </p>
      </div>

      <ContractTable contracts={contracts} rooms={rooms} tenants={tenants} />
    </div>
  );
}
