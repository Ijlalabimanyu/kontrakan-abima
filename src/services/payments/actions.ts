"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { paymentSchema } from "@/services/payments/schema";
import { createClient } from "@/lib/supabase/server";

const PAYMENT_PROOF_BUCKET = "payment-proofs";
const MAX_PROOF_SIZE = 5 * 1024 * 1024;
const ALLOWED_PROOF_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

interface PaymentRpcResult {
  success: true;
  payment_id: string;
  payment_number: string;
  invoice_status: "PARTIAL" | "PAID";
  paid_amount: number;
  remaining_amount: number;
}

interface PaymentActionResult {
  success: boolean;
  message: string;
  data?: Omit<PaymentRpcResult, "success">;
}

interface PayableInvoiceOptionData {
  id: string;
  invoice_number: string;
  billing_period: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
}

interface PayableInvoiceOptionsResult {
  success: boolean;
  message: string;
  data: PayableInvoiceOptionData[];
}

interface PaymentHistoryItem {
  id: string;
  payment_number: string;
  amount: number;
  payment_date: string;
  payment_method: "CASH" | "TRANSFER" | "QRIS";
}

interface PaymentHistoryActionResult {
  success: boolean;
  message: string;
  data: PaymentHistoryItem[];
}

interface UploadPaymentProofResult {
  success: boolean;
  message: string;
  path?: string;
}

type PaymentProofUrlResult =
  { success: true; url: string } | { success: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPaymentRpcResult(value: unknown): value is PaymentRpcResult {
  if (!isRecord(value)) return false;

  return (
    value.success === true &&
    typeof value.payment_id === "string" &&
    typeof value.payment_number === "string" &&
    (value.invoice_status === "PARTIAL" || value.invoice_status === "PAID") &&
    typeof value.paid_amount === "number" &&
    Number.isFinite(value.paid_amount) &&
    typeof value.remaining_amount === "number" &&
    Number.isFinite(value.remaining_amount)
  );
}

function mapPaymentError(error: string): string {
  const message = error.toLowerCase();

  if (message.includes("invoice not found")) {
    return "Invoice tidak ditemukan.";
  }

  if (message.includes("cannot receive payments")) {
    return "Invoice ini tidak dapat menerima pembayaran.";
  }

  if (message.includes("exceeds remaining")) {
    return "Nominal pembayaran melebihi sisa tagihan.";
  }

  if (message.includes("must be greater than zero")) {
    return "Nominal pembayaran harus lebih dari 0.";
  }

  if (message.includes("invalid payment method")) {
    return "Metode pembayaran tidak valid.";
  }

  if (message.includes("unauthorized")) {
    return "Sesi login tidak valid. Silakan login kembali.";
  }

  return "Gagal mencatat pembayaran. Silakan coba kembali.";
}

export async function createPayment(
  values: unknown,
  proofPath: string | null = null,
): Promise<PaymentActionResult> {
  const validation = paymentSchema.safeParse(values);

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ?? "Data pembayaran tidak valid.",
    };
  }

  const {
    invoice_id,
    amount,
    payment_date,
    payment_method,
    reference_number,
    notes,
  } = validation.data;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (proofPath && !proofPath.startsWith(`${user.id}/${invoice_id}/`)) {
    return {
      success: false,
      message: "Path bukti pembayaran tidak valid.",
    };
  }

  const { data, error } = await supabase.rpc("create_invoice_payment", {
    p_invoice_id: invoice_id,
    p_amount: amount,
    p_payment_date: payment_date,
    p_payment_method: payment_method,
    p_reference_number: reference_number || null,
    p_proof_path: proofPath,
    p_notes: notes || null,
  });

  if (error) {
    console.error("Create payment RPC error:", error);

    if (proofPath) {
      const { error: removeError } = await supabase.storage
        .from(PAYMENT_PROOF_BUCKET)
        .remove([proofPath]);

      if (removeError) {
        console.error("Remove orphaned payment proof error:", removeError);
      }
    }

    return {
      success: false,
      message: mapPaymentError(error.message),
    };
  }

  if (!isPaymentRpcResult(data)) {
    console.error("Unexpected create payment RPC result:", data);

    return {
      success: false,
      message: "Gagal menyimpan pembayaran.",
    };
  }

  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Pembayaran berhasil dicatat.",
    data: {
      payment_id: data.payment_id,
      payment_number: data.payment_number,
      invoice_status: data.invoice_status,
      paid_amount: data.paid_amount,
      remaining_amount: data.remaining_amount,
    },
  };
}

export async function uploadPaymentProof(
  invoiceId: string,
  file: File,
): Promise<UploadPaymentProofResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (!z.string().uuid().safeParse(invoiceId).success) {
    return {
      success: false,
      message: "Invoice tidak valid.",
    };
  }

  if (
    !file ||
    typeof file.size !== "number" ||
    file.size <= 0 ||
    file.size > MAX_PROOF_SIZE ||
    typeof file.arrayBuffer !== "function"
  ) {
    return {
      success: false,
      message: "Ukuran file harus antara 1 byte dan 5 MB.",
    };
  }

  const extension = ALLOWED_PROOF_TYPES[file.type];

  if (!extension) {
    return {
      success: false,
      message: "Format file tidak didukung.",
    };
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("rental_invoices")
    .select("id")
    .eq("id", invoiceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (invoiceError) {
    console.error("Validate payment proof invoice error:", invoiceError);

    return {
      success: false,
      message: "Gagal memvalidasi invoice.",
    };
  }

  if (!invoice) {
    return {
      success: false,
      message: "Invoice tidak ditemukan.",
    };
  }

  const path = `${user.id}/${invoiceId}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(PAYMENT_PROOF_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload payment proof error:", uploadError);

    return {
      success: false,
      message: "Gagal mengunggah bukti pembayaran.",
    };
  }

  return {
    success: true,
    message: "Bukti pembayaran berhasil diunggah.",
    path,
  };
}

export async function getPaymentProofUrl(
  proofPath: string,
): Promise<PaymentProofUrlResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  if (!proofPath || !proofPath.startsWith(`${user.id}/`)) {
    return {
      success: false,
      message: "Akses bukti pembayaran ditolak.",
    };
  }

  const { data, error } = await supabase.storage
    .from(PAYMENT_PROOF_BUCKET)
    .createSignedUrl(proofPath, 300);

  if (error) {
    console.error("Get payment proof error:", error);

    return {
      success: false,
      message: "Gagal membuka bukti pembayaran.",
    };
  }

  return {
    success: true,
    url: data.signedUrl,
  };
}

export async function getPayableInvoiceOptions(): Promise<PayableInvoiceOptionsResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Unauthorized",
      data: [],
    };
  }

  const { data: invoices, error } = await supabase
    .from("rental_invoices")
    .select("id, invoice_number, billing_period, due_date, amount, status")
    .eq("owner_id", user.id)
    .in("status", ["UNPAID", "PARTIAL"])
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Get payable invoices error:", error);

    return {
      success: false,
      message: "Gagal mengambil daftar invoice.",
      data: [],
    };
  }

  if (!invoices?.length) {
    return {
      success: true,
      message: "Tidak ada invoice yang belum lunas.",
      data: [],
    };
  }

  const invoiceIds = invoices.map((invoice) => invoice.id);
  const { data: payments, error: paymentError } = await supabase
    .from("rental_invoice_payments")
    .select("invoice_id, amount")
    .eq("owner_id", user.id)
    .in("invoice_id", invoiceIds);

  if (paymentError) {
    console.error("Get payments for payable invoices error:", paymentError);

    return {
      success: false,
      message: "Gagal mengambil daftar invoice.",
      data: [],
    };
  }

  const paidAmountMap = new Map<string, number>();

  (payments ?? []).forEach((payment) => {
    const paidAmount = paidAmountMap.get(payment.invoice_id) ?? 0;
    paidAmountMap.set(payment.invoice_id, paidAmount + Number(payment.amount));
  });

  const data = invoices
    .map((invoice) => {
      const amount = Number(invoice.amount);
      const paidAmount = paidAmountMap.get(invoice.id) ?? 0;

      return {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        billing_period: invoice.billing_period,
        due_date: invoice.due_date,
        amount,
        paid_amount: paidAmount,
        remaining_amount: Math.max(0, amount - paidAmount),
      };
    })
    .filter((invoice) => invoice.remaining_amount > 0);

  return {
    success: true,
    message: "Berhasil mengambil invoice.",
    data,
  };
}

export async function getInvoicePaymentHistoryAction(
  invoiceId: string,
): Promise<PaymentHistoryActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      message: "Unauthorized",
      data: [],
    };
  }

  if (!z.string().uuid().safeParse(invoiceId).success) {
    return {
      success: false,
      message: "Invoice tidak ditemukan.",
      data: [],
    };
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("rental_invoices")
    .select("id")
    .eq("id", invoiceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (invoiceError) {
    console.error("Validate payment history invoice error:", invoiceError);

    return {
      success: false,
      message: "Gagal memvalidasi invoice.",
      data: [],
    };
  }

  if (!invoice) {
    return {
      success: false,
      message: "Invoice tidak ditemukan.",
      data: [],
    };
  }

  const { data, error } = await supabase
    .from("rental_invoice_payments")
    .select("id, payment_number, amount, payment_date, payment_method")
    .eq("owner_id", user.id)
    .eq("invoice_id", invoiceId)
    .order("payment_date", { ascending: false });

  if (error) {
    console.error("Get invoice payment history error:", error);

    return {
      success: false,
      message: "Gagal mengambil riwayat pembayaran.",
      data: [],
    };
  }

  return {
    success: true,
    message: "Riwayat pembayaran berhasil diambil.",
    data: (data ?? []).map((item) => ({
      ...item,
      amount: Number(item.amount),
    })),
  };
}
