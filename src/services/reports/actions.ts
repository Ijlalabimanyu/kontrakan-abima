"use server";

import type { FinancialReportData } from "@/services/reports/interface";
import { reportSchema } from "@/services/reports/schema";
import { getFinancialReport } from "@/services/reports/service";

export async function getFinancialReportAction(
  values: unknown,
): Promise<FinancialReportData> {
  const validation = reportSchema.safeParse(values);

  if (!validation.success) {
    throw new Error(
      validation.error.issues[0]?.message ?? "Filter laporan tidak valid",
    );
  }

  return getFinancialReport(validation.data);
}
