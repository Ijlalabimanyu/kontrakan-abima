import { z } from "zod";

const optionalDateSchema = z
  .string()
  .nullable()
  .refine(
    (value) => {
      if (!value) return true;

      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      if (!match) return false;

      const [, year, month, day] = match.map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));

      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
      );
    },
    { message: "Tanggal tidak valid" },
  );

export const maintenanceSchema = z.object({
  property_id: z.string().uuid("Properti wajib dipilih"),
  room_id: z.union([z.string().uuid(), z.literal("")]),
  title: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter")
    .max(150, "Judul maksimal 150 karakter"),
  description: z.string().trim().min(5, "Deskripsi minimal 5 karakter"),
  category: z.enum([
    "ELECTRICAL",
    "PLUMBING",
    "AC",
    "FURNITURE",
    "BUILDING",
    "INTERNET",
    "OTHER",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  scheduled_date: optionalDateSchema,
});

export const completeMaintenanceSchema = z
  .object({
    completion_notes: z.string().max(1000).default(""),
    cost_amount: z
      .number()
      .min(0, "Biaya tidak boleh negatif")
      .max(999999999999, "Biaya terlalu besar")
      .refine(
        (value) => Number.isInteger(value * 100),
        "Maksimal 2 angka desimal",
      ),
    cost_description: z.string().max(500).default(""),
    expense_date: optionalDateSchema,
    payment_method: z.enum(["CASH", "TRANSFER", "QRIS"]).nullable(),
    reference_number: z.string().max(100).default(""),
  })
  .superRefine((value, ctx) => {
    if (value.cost_amount > 0) {
      if (!value.expense_date) {
        ctx.addIssue({
          code: "custom",
          path: ["expense_date"],
          message: "Tanggal pengeluaran wajib diisi",
        });
      }

      if (!value.payment_method) {
        ctx.addIssue({
          code: "custom",
          path: ["payment_method"],
          message: "Metode pembayaran wajib dipilih",
        });
      }
    }
  });

export const maintenanceStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "CANCELLED"]),
});
