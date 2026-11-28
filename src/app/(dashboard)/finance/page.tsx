import { Suspense } from "react";
import { connection } from "next/server";
import FinancePage from "@/features/finance/FinancePage";
import FinanceLoading from "@/features/finance/FinanceLoading";
import { getFinancePageData } from "@/services/finance/service";

async function FinanceContent() {
  await connection();

  const data = await getFinancePageData();

  return <FinancePage data={data} />;
}

export default function FinanceRoute() {
  return (
    <Suspense fallback={<FinanceLoading />}>
      <FinanceContent />
    </Suspense>
  );
}
