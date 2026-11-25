import MaintenanceTable from "@/features/maintenance/MaintenanceTable";
import {
  getMaintenancePropertyOptions,
  getMaintenanceRoomOptions,
  getMaintenances,
} from "@/services/maintenance/service";

export default async function MaintenancePage() {
  const [maintenances, properties, rooms] = await Promise.all([
    getMaintenances(),
    getMaintenancePropertyOptions(),
    getMaintenanceRoomOptions(),
  ]);
  const summary = {
    total: maintenances.length,
    open: maintenances.filter((item) => item.status === "OPEN").length,
    inProgress: maintenances.filter((item) => item.status === "IN_PROGRESS")
      .length,
    completed: maintenances.filter((item) => item.status === "COMPLETED")
      .length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Maintenance Management</h1>
        <p className="text-sm text-slate-500">
          Kelola laporan dan pekerjaan perawatan properti.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Maintenance", value: summary.total },
          { label: "Open", value: summary.open },
          { label: "Dalam Proses", value: summary.inProgress },
          { label: "Selesai", value: summary.completed },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border bg-white p-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-4">
        <MaintenanceTable
          data={maintenances}
          properties={properties}
          rooms={rooms}
        />
      </div>
    </div>
  );
}
