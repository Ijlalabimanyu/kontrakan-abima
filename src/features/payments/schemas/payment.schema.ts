import { z } from "zod";

export const paymentSchema = z.object({
  invoice_id: z.string().uuid("Invoice tidak valid"),

  amount: z
    .number({
      error: "Nominal pembayaran wajib diisi",
    })
    .positive("Nominal pembayaran harus lebih dari 0")
    .max(9999999999999.99, "Nominal pembayaran terlalu besar")
    .refine(
      (value) =>
        Number.isFinite(value) && Number(value.toFixed(2)) === value,
      "Nominal maksimal 2 angka desimal",
    ),

  payment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal pembayaran tidak valid")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);

      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }, "Tanggal pembayaran tidak valid"),

  payment_method: z.enum(["CASH", "TRANSFER", "QRIS"]),

  reference_number: z
    .string()
    .trim()
    .max(100, "Nomor referensi maksimal 100 karakter")
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(500, "Catatan maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
});

export type PaymentSchema = z.infer<typeof paymentSchema>;
