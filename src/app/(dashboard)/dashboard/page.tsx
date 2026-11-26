import { Suspense } from "react";
import { connection } from "next/server";
import DashboardView from "@/features/dashboard/DashboardView";
import { getDashboardAnalytics } from "@/services/dashboard/service";
import DashboardLoading from "@/features/dashboard/components/DashboardLoading";

async function DashboardContent() {
  await connection();

  const dashboard = await getDashboardAnalytics();

  return <DashboardView dashboard={dashboard} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
