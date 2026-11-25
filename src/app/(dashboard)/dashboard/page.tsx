import { Suspense } from "react";
import { connection } from "next/server";

import DashboardView from "@/features/dashboard/DashboardView";
import { getDashboardAnalytics } from "@/services/dashboard/service";

async function DashboardContent() {
  await connection();

  const dashboard = await getDashboardAnalytics();

  return <DashboardView dashboard={dashboard} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}
