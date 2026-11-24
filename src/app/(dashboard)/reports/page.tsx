import { Suspense } from "react";
import { connection } from "next/server";

import ReportsPage from "@/features/reports/components/ReportsPage";
import { getFinancialReport } from "@/features/reports/services/report.service";

async function ReportsContent() {
  await connection();

  const jakartaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
  const [year, month] = jakartaDate.split("-").map(Number);
  const initialData = await getFinancialReport({
    period_type: "MONTHLY",
    year,
    month,
  });

  return <ReportsPage initialData={initialData} />;
}

export default function ReportsRoute() {
  return (
    <Suspense fallback={<p className="py-10 text-center">Memuat laporan...</p>}>
      <ReportsContent />
    </Suspense>
  );
}
