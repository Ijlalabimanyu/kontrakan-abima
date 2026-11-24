import { z } from "zod";

export const reportSchema = z
  .object({
    period_type: z.enum(["MONTHLY", "YEARLY"]),
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(1).max(12).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.period_type === "MONTHLY" && !value.month) {
      ctx.addIssue({
        code: "custom",
        path: ["month"],
        message: "Bulan wajib dipilih untuk laporan bulanan",
      });
    }
  });

export type ReportSchemaValues = z.infer<typeof reportSchema>;
