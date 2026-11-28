import { Suspense } from "react";
import { connection } from "next/server";
import {
  getContracts,
  getContractRooms,
  getContractTenants,
} from "@/services/contract/service";
import ContractTable from "@/features/contracts/ContractTable";
import ContractsLoading from "@/features/contracts/ContractLoading";

async function ContractsContent() {
  await connection();

  const [contracts, rooms, tenants] = await Promise.all([
    getContracts(),
    getContractRooms(),
    getContractTenants(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#202C26]">
          Manajemen Kontrak
        </h1>

        <p className="mt-1 text-sm text-[#68756D]">
          Kelola penyewaan kamar dan riwayat kontrak penyewa.
        </p>
      </div>

      <ContractTable contracts={contracts} rooms={rooms} tenants={tenants} />
    </div>
  );
}

export default function ContractsPage() {
  return (
    <Suspense fallback={<ContractsLoading />}>
      <ContractsContent />
    </Suspense>
  );
}
