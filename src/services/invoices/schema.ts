import { z } from "zod";

export const generateInvoiceSchema = z.object({
  billing_period: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Periode tagihan tidak valid"),
});

export type GenerateInvoiceSchema = z.infer<typeof generateInvoiceSchema>;
