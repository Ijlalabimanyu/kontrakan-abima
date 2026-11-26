import { z } from "zod";

export const propertySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama properti minimal 3 karakter")
    .max(150, "Nama properti maksimal 150 karakter"),
  address: z.string().trim().max(1000, "Alamat terlalu panjang"),
  description: z.string().trim().max(1000, "Deskripsi terlalu panjang"),
});

export type PropertySchema = z.infer<typeof propertySchema>;
