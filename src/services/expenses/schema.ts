import { z } from "zod";

export const expenseSchema = z.object({
  category: z.enum(
    [
      "ELECTRICITY",
      "WATER",
      "INTERNET",
      "MAINTENANCE",
      "CLEANING",
      "SUPPLIES",
      "TAX",
      "OTHER",
    ],
    {
      error: "Kategori pengeluaran wajib dipilih",
    },
  ),

  description: z
    .string()
    .trim()
    .min(1, "Deskripsi wajib diisi")
    .max(255, "Deskripsi maksimal 255 karakter"),

  amount: z
    .number({
      error: "Nominal wajib diisi",
    })
    .positive("Nominal harus lebih besar dari 0")
    .max(9999999999999.99, "Nominal terlalu besar")
    .refine(
      (value) => Number.isFinite(value) && Number(value.toFixed(2)) === value,
      "Nominal maksimal 2 angka desimal",
    ),

  expense_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);

      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }, "Tanggal tidak valid"),

  payment_method: z.enum(["CASH", "TRANSFER", "QRIS"], {
    error: "Metode pembayaran wajib dipilih",
  }),

  reference_number: z
    .string()
    .trim()
    .max(100, "Nomor referensi maksimal 100 karakter")
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500, "Catatan maksimal 500 karakter")
    .optional(),
});

export type ExpenseSchemaValues = z.infer<typeof expenseSchema>;
