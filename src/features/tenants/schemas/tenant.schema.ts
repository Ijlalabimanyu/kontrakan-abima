import { z } from "zod";

export const tenantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(150, "Nama maksimal 150 karakter"),

  phone: z
    .string()
    .trim()
    .min(1, "Nomor telepon wajib diisi")
    .max(30, "Nomor telepon maksimal 30 karakter")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");

      return (
        /^\+?[0-9\s()-]+$/.test(value) &&
        digits.length >= 8 &&
        digits.length <= 15
      );
    }, "Format nomor telepon tidak valid"),

  email: z
    .string()
    .trim()
    .max(150, "Email maksimal 150 karakter")
    .refine(
      (value) => !value || z.email().safeParse(value).success,
      "Format email tidak valid",
    ),

  identity_number: z
    .string()
    .trim()
    .max(100, "Nomor identitas maksimal 100 karakter"),

  address: z.string().trim().max(1000, "Alamat maksimal 1000 karakter"),
});

export type TenantSchema = z.infer<typeof tenantSchema>;
