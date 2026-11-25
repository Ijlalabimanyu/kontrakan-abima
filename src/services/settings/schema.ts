import { z } from "zod";

export const ownerProfileSchema = z.object({
  owner_name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  contact_phone: z
    .string()
    .trim()
    .max(30, "Nomor telepon maksimal 30 karakter"),
});

export const businessSettingsSchema = z.object({
  business_name: z.string().trim().max(150, "Nama usaha maksimal 150 karakter"),
  business_address: z
    .string()
    .trim()
    .max(1000, "Alamat maksimal 1000 karakter"),
  business_description: z
    .string()
    .trim()
    .max(1000, "Deskripsi maksimal 1000 karakter"),
});

export const preferenceSchema = z.object({
  currency: z.literal("IDR"),
  timezone: z.enum(["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]),
  date_format: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
});

export const paymentAccountSchema = z
  .object({
    account_type: z.enum(["BANK_TRANSFER", "QRIS"]),
    label: z
      .string()
      .trim()
      .min(1, "Nama metode pembayaran wajib diisi")
      .max(100),
    bank_name: z.string().trim().max(100),
    account_name: z.string().trim().max(150),
    account_number: z.string().trim().max(100),
    is_active: z.boolean(),
    is_default: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.account_type === "BANK_TRANSFER") {
      if (!value.bank_name)
        ctx.addIssue({
          code: "custom",
          path: ["bank_name"],
          message: "Nama bank wajib diisi",
        });
      if (!value.account_name)
        ctx.addIssue({
          code: "custom",
          path: ["account_name"],
          message: "Nama pemilik rekening wajib diisi",
        });
      if (!value.account_number)
        ctx.addIssue({
          code: "custom",
          path: ["account_number"],
          message: "Nomor rekening wajib diisi",
        });
    }
    if (value.is_default && !value.is_active) {
      ctx.addIssue({
        code: "custom",
        path: ["is_default"],
        message: "Metode pembayaran default harus aktif",
      });
    }
  });

export const passwordSchema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm_password: z.string(),
  })
  .refine((value) => value.password === value.confirm_password, {
    path: ["confirm_password"],
    message: "Konfirmasi password tidak sama",
  });
