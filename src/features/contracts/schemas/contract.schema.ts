import { z } from "zod";

export const contractSchema = z
  .object({
    room_id: z.string().uuid("Pilih kamar yang valid"),

    tenant_id: z.string().uuid("Pilih penyewa yang valid"),

    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal mulai tidak valid")
      .refine((value) => {
        const date = new Date(`${value}T00:00:00.000Z`);
        return (
          !Number.isNaN(date.getTime()) &&
          date.toISOString().slice(0, 10) === value
        );
      }, "Tanggal mulai tidak valid"),

    end_date: z.string().refine((value) => {
      if (!value) return true;

      const date = new Date(`${value}T00:00:00.000Z`);

      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }, "Tanggal akhir tidak valid"),

    monthly_price: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Harga sewa tidak valid")
      .refine(
        (value) =>
          Number.isFinite(Number(value)) &&
          Number(value) > 0 &&
          Number(value) <= 9999999999999.99,
        "Harga sewa harus lebih dari 0",
      ),

    payment_due_day: z
      .string()
      .regex(/^\d+$/, "Tanggal pembayaran tidak valid")
      .refine(
        (value) => Number(value) >= 1 && Number(value) <= 28,
        "Tanggal pembayaran harus antara 1 sampai 28",
      ),
  })
  .refine((data) => !data.end_date || data.end_date >= data.start_date, {
    message: "Tanggal akhir tidak boleh sebelum tanggal mulai",
    path: ["end_date"],
  });

export type ContractSchema = z.infer<typeof contractSchema>;
