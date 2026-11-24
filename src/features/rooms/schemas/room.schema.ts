import { z } from "zod";

export const roomSchema = z.object({
  property_id: z.string().uuid("Properti tidak valid"),

  room_number: z
    .string()
    .trim()
    .min(1, "Nomor kamar wajib diisi")
    .max(50, "Nomor kamar maksimal 50 karakter"),

  monthly_price: z
    .string()
    .trim()
    .min(1, "Harga sewa wajib diisi")
    .refine(
      (value) =>
        /^\d+(\.\d{1,2})?$/.test(value) &&
        Number.isFinite(Number(value)) &&
        Number(value) > 0 &&
        Number(value) <= 9999999999999.99,
      "Harga sewa harus berupa angka positif dengan maksimal 2 desimal",
    ),

  status: z.enum(["AVAILABLE", "MAINTENANCE"]),

  description: z.string().trim().max(1000, "Deskripsi maksimal 1000 karakter"),
});

export type RoomSchema = z.infer<typeof roomSchema>;
