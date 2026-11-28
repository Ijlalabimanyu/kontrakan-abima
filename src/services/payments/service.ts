import { createClient } from "@/lib/supabase/server";

import {
  PaymentFilterValues,
  PaymentInvoiceOption,
  PaymentModel,
} from "./interface";

interface InvoiceRelation {
  id: string;
  invoice_number: string;
  amount: number | string;
  billing_period: string;
  due_date: string;
  status: string;
  contract_id: string;
}

interface ContractRelation {
  id: string;
  room_id: string;
  tenant_id: string;
}

interface RoomRelation {
  id: string;
  room_number: string;
  property_id: string;
}

interface TenantRelation {
  id: string;
  name: string;
  phone: string | null;
}

interface PropertyRelation {
  id: string;
  name: string;
}

interface InvoiceRelations {
  invoiceMap: Map<string, InvoiceRelation>;
  contractMap: Map<string, ContractRelation>;
  roomMap: Map<string, RoomRelation>;
  tenantMap: Map<string, TenantRelation>;
  propertyMap: Map<string, PropertyRelation>;
}

function getJakartaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function getInvoiceRelations(
  invoiceIds: string[],
  ownerId: string,
): Promise<InvoiceRelations> {
  const supabase = await createClient();

  if (!invoiceIds.length) {
    return {
      invoiceMap: new Map<string, InvoiceRelation>(),
      contractMap: new Map<string, ContractRelation>(),
      roomMap: new Map<string, RoomRelation>(),
      tenantMap: new Map<string, TenantRelation>(),
      propertyMap: new Map<string, PropertyRelation>(),
    };
  }

  const { data: invoices, error: invoiceError } = await supabase
    .from("rental_invoices")
    .select(
      "id, invoice_number, amount, billing_period, due_date, status, contract_id",
    )
    .eq("owner_id", ownerId)
    .in("id", invoiceIds);

  if (invoiceError) {
    throw new Error(invoiceError.message);
  }

  const contractIds = [
    ...new Set((invoices ?? []).map((invoice) => invoice.contract_id)),
  ];

  const { data: contracts, error: contractError } = contractIds.length
    ? await supabase
        .from("rental_contracts")
        .select("id, room_id, tenant_id")
        .eq("owner_id", ownerId)
        .in("id", contractIds)
    : { data: [], error: null };

  if (contractError) {
    throw new Error(contractError.message);
  }

  const roomIds = [
    ...new Set((contracts ?? []).map((contract) => contract.room_id)),
  ];
  const tenantIds = [
    ...new Set((contracts ?? []).map((contract) => contract.tenant_id)),
  ];

  const [roomsResult, tenantsResult] = await Promise.all([
    roomIds.length
      ? supabase
          .from("rooms")
          .select("id, room_number, property_id")
          .eq("owner_id", ownerId)
          .in("id", roomIds)
      : Promise.resolve({ data: [], error: null }),

    tenantIds.length
      ? supabase
          .from("tenants")
          .select("id, name, phone")
          .eq("owner_id", ownerId)
          .in("id", tenantIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (roomsResult.error) {
    throw new Error(roomsResult.error.message);
  }

  if (tenantsResult.error) {
    throw new Error(tenantsResult.error.message);
  }

  const propertyIds = [
    ...new Set((roomsResult.data ?? []).map((room) => room.property_id)),
  ];

  const { data: properties, error: propertyError } = propertyIds.length
    ? await supabase
        .from("properties")
        .select("id, name")
        .eq("owner_id", ownerId)
        .in("id", propertyIds)
    : { data: [], error: null };

  if (propertyError) {
    throw new Error(propertyError.message);
  }

  const invoiceMap = new Map<string, InvoiceRelation>();
  const contractMap = new Map<string, ContractRelation>();
  const roomMap = new Map<string, RoomRelation>();
  const tenantMap = new Map<string, TenantRelation>();
  const propertyMap = new Map<string, PropertyRelation>();

  (invoices ?? []).forEach((invoice) => {
    invoiceMap.set(invoice.id, {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      amount: invoice.amount,
      billing_period: invoice.billing_period,
      due_date: invoice.due_date,
      status: invoice.status,
      contract_id: invoice.contract_id,
    });
  });
  (contracts ?? []).forEach((contract) => {
    contractMap.set(contract.id, {
      id: contract.id,
      room_id: contract.room_id,
      tenant_id: contract.tenant_id,
    });
  });
  (roomsResult.data ?? []).forEach((room) => {
    roomMap.set(room.id, {
      id: room.id,
      room_number: room.room_number,
      property_id: room.property_id,
    });
  });
  (tenantsResult.data ?? []).forEach((tenant) => {
    tenantMap.set(tenant.id, {
      id: tenant.id,
      name: tenant.name,
      phone: tenant.phone,
    });
  });
  (properties ?? []).forEach((property) => {
    propertyMap.set(property.id, {
      id: property.id,
      name: property.name,
    });
  });

  return { invoiceMap, contractMap, roomMap, tenantMap, propertyMap };
}

export async function getPayments(
  filters?: Partial<PaymentFilterValues>,
): Promise<PaymentModel[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: payments, error } = await supabase
    .from("rental_invoice_payments")
    .select("*")
    .eq("owner_id", user.id)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!payments?.length) {
    return [];
  }

  const invoiceIds = [
    ...new Set(payments.map((payment) => payment.invoice_id)),
  ];
  const relations = await getInvoiceRelations(invoiceIds, user.id);

  const result: PaymentModel[] = payments.map((payment) => {
    const invoice = relations.invoiceMap.get(payment.invoice_id);
    const contract = invoice
      ? relations.contractMap.get(invoice.contract_id)
      : null;
    const room = contract ? relations.roomMap.get(contract.room_id) : null;
    const tenant = contract
      ? relations.tenantMap.get(contract.tenant_id)
      : null;
    const property = room ? relations.propertyMap.get(room.property_id) : null;

    return {
      ...payment,
      amount: Number(payment.amount),
      invoice_amount: Number(invoice?.amount ?? 0),
      invoice_number: invoice?.invoice_number ?? "-",
      billing_period: invoice?.billing_period ?? "-",
      invoice_status: invoice?.status ?? "-",
      tenant_name: tenant?.name ?? "-",
      tenant_phone: tenant?.phone ?? "-",
      room_number: room?.room_number ?? "-",
      property_name: property?.name ?? "-",
    };
  });

  let filtered = result;

  if (filters?.search?.trim()) {
    const keyword = filters.search.trim().toLowerCase();

    filtered = filtered.filter((payment) =>
      [
        payment.payment_number,
        payment.invoice_number,
        payment.tenant_name,
        payment.tenant_phone,
        payment.room_number,
        payment.property_name,
      ].some((value) => value.toLowerCase().includes(keyword)),
    );
  }

  if (filters?.payment_method) {
    filtered = filtered.filter(
      (payment) => payment.payment_method === filters.payment_method,
    );
  }

  if (filters?.payment_date) {
    filtered = filtered.filter(
      (payment) => payment.payment_date === filters.payment_date,
    );
  }

  return filtered;
}

export async function getPayableInvoices(): Promise<PaymentInvoiceOption[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: invoices, error } = await supabase
    .from("rental_invoices")
    .select(
      "id, invoice_number, contract_id, billing_period, due_date, amount, status",
    )
    .eq("owner_id", user.id)
    .in("status", ["UNPAID", "PARTIAL"])
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!invoices?.length) {
    return [];
  }

  const invoiceIds = invoices.map((invoice) => invoice.id);
  const { data: payments, error: paymentError } = await supabase
    .from("rental_invoice_payments")
    .select("invoice_id, amount")
    .eq("owner_id", user.id)
    .in("invoice_id", invoiceIds);

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  const paidAmountMap = new Map<string, number>();

  (payments ?? []).forEach((payment) => {
    const currentAmount = paidAmountMap.get(payment.invoice_id) ?? 0;
    paidAmountMap.set(
      payment.invoice_id,
      currentAmount + Number(payment.amount),
    );
  });

  const relations = await getInvoiceRelations(invoiceIds, user.id);
  const today = getJakartaDate();

  return invoices
    .map((invoice) => {
      const contract = relations.contractMap.get(invoice.contract_id);
      const room = contract ? relations.roomMap.get(contract.room_id) : null;
      const tenant = contract
        ? relations.tenantMap.get(contract.tenant_id)
        : null;
      const paidAmount = paidAmountMap.get(invoice.id) ?? 0;
      const remainingAmount = Math.max(0, Number(invoice.amount) - paidAmount);

      return {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        tenant_name: tenant?.name ?? "-",
        room_number: room?.room_number ?? "-",
        billing_period: invoice.billing_period,
        due_date: invoice.due_date,
        amount: Number(invoice.amount),
        paid_amount: paidAmount,
        remaining_amount: remainingAmount,
        status: invoice.due_date < today ? "OVERDUE" : invoice.status,
      };
    })
    .filter((invoice) => invoice.remaining_amount > 0);
}

export async function getInvoicePaymentHistory(invoiceId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("rental_invoice_payments")
    .select("*")
    .eq("owner_id", user.id)
    .eq("invoice_id", invoiceId)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((payment) => ({
    ...payment,
    amount: Number(payment.amount),
  }));
}
