"use server";

import type { FinancialReportData } from "@/features/reports/interfaces/report.interface";
import { reportSchema } from "@/features/reports/schemas/report.schema";
import { getFinancialReport } from "@/features/reports/services/report.service";

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
