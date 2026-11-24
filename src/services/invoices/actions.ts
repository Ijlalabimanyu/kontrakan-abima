"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { generateInvoiceSchema } from "@/features/invoices/schemas/invoice.schema";
import { createClient } from "@/lib/supabase/server";

interface GenerateInvoiceResult {
  success: boolean;
  message: string;
  createdCount?: number;
  skippedCount?: number;
}

interface ContractForInvoice {
  id: string;
  monthly_price: number;
  payment_due_day: number;
  start_date: string;
  end_date: string | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
}

function getMonthDates(billingPeriod: string) {
  const [yearText, monthText] = billingPeriod.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  const lastDayDate = new Date(Date.UTC(2000, 0, 1));
  lastDayDate.setUTCFullYear(year, month, 0);
  const lastDay = lastDayDate.getUTCDate();

  return {
    monthStart: `${yearText}-${monthText}-01`,
    monthEnd: `${yearText}-${monthText}-${String(lastDay).padStart(2, "0")}`,
    lastDay,
  };
}

function getDueDate(
  billingPeriod: string,
  paymentDueDay: number,
  lastDay: number,
) {
  const [year, month] = billingPeriod.split("-");
  const dueDay = Math.min(paymentDueDay, lastDay);

  return `${year}-${month}-${String(dueDay).padStart(2, "0")}`;
}

export async function generateInvoices(
  values: unknown,
): Promise<GenerateInvoiceResult> {
  const validation = generateInvoiceSchema.safeParse(values);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message ?? "Periode tidak valid",
    };
  }

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

  const { billing_period: billingPeriod } = validation.data;
  const { monthStart, monthEnd, lastDay } = getMonthDates(billingPeriod);
  const { data: contractData, error: contractError } = await supabase
    .from("rental_contracts")
    .select("id, monthly_price, payment_due_day, start_date, end_date, status")
    .eq("owner_id", user.id)
    .in("status", ["ACTIVE", "COMPLETED"])
    .lte("start_date", monthEnd);

  if (contractError) {
    return {
      success: false,
      message: contractError.message,
    };
  }

  const eligibleContracts = ((contractData ?? []) as ContractForInvoice[]).filter(
    (contract) => contract.end_date === null || contract.end_date >= monthStart,
  );

  if (eligibleContracts.length === 0) {
    return {
      success: true,
      message: "Tidak ada kontrak untuk periode tagihan ini.",
      createdCount: 0,
      skippedCount: 0,
    };
  }

  const invoicePayload = eligibleContracts.map((contract) => {
    const invoiceId = randomUUID();

    return {
      id: invoiceId,
      owner_id: user.id,
      contract_id: contract.id,
      invoice_number: `INV-${billingPeriod.replace("-", "")}-${invoiceId
        .slice(0, 8)
        .toUpperCase()}`,
      billing_period: monthStart,
      due_date: getDueDate(billingPeriod, contract.payment_due_day, lastDay),
      amount: contract.monthly_price,
      status: "UNPAID" as const,
    };
  });

  const { data: insertedInvoices, error: insertError } = await supabase
    .from("rental_invoices")
    .upsert(invoicePayload, {
      onConflict: "contract_id,billing_period",
      ignoreDuplicates: true,
    })
    .select("id");

  if (insertError) {
    return {
      success: false,
      message: insertError.message,
    };
  }

  const createdCount = insertedInvoices?.length ?? 0;
  const skippedCount = eligibleContracts.length - createdCount;

  revalidatePath("/invoices");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Berhasil membuat ${createdCount} invoice.`,
    createdCount,
    skippedCount,
  };
}
