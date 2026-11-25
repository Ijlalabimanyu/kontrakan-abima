import { createClient } from "@/lib/supabase/server";

import {
  InvoiceDisplayStatus,
  InvoiceFilterValues,
  InvoiceModel,
} from "./interface";

function getJakartaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getInvoiceDisplayStatus(
  status: InvoiceModel["status"],
  dueDate: string,
  today: string,
): InvoiceDisplayStatus {
  if ((status === "UNPAID" || status === "PARTIAL") && dueDate < today) {
    return "OVERDUE";
  }

  return status;
}

export async function getInvoices(
  filters?: Partial<InvoiceFilterValues>,
): Promise<InvoiceModel[]> {
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
    .select("*")
    .eq("owner_id", user.id)
    .order("billing_period", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!invoices?.length) {
    return [];
  }

  const contractIds = [
    ...new Set(invoices.map((invoice) => invoice.contract_id)),
  ];

  const { data: contracts, error: contractError } = await supabase
    .from("rental_contracts")
    .select("id, room_id, tenant_id")
    .eq("owner_id", user.id)
    .in("id", contractIds);

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
          .eq("owner_id", user.id)
          .in("id", roomIds)
      : Promise.resolve({ data: [], error: null }),

    tenantIds.length
      ? supabase
          .from("tenants")
          .select("id, name, phone")
          .eq("owner_id", user.id)
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
        .eq("owner_id", user.id)
        .in("id", propertyIds)
    : { data: [], error: null };

  if (propertyError) {
    throw new Error(propertyError.message);
  }

  const contractMap = new Map(
    (contracts ?? []).map((contract) => [contract.id, contract]),
  );
  const roomMap = new Map(
    (roomsResult.data ?? []).map((room) => [room.id, room]),
  );
  const tenantMap = new Map(
    (tenantsResult.data ?? []).map((tenant) => [tenant.id, tenant]),
  );
  const propertyMap = new Map(
    (properties ?? []).map((property) => [property.id, property]),
  );

  const today = getJakartaDate();
  const result: InvoiceModel[] = invoices.map((invoice) => {
    const contract = contractMap.get(invoice.contract_id);
    const room = contract ? roomMap.get(contract.room_id) : null;
    const tenant = contract ? tenantMap.get(contract.tenant_id) : null;
    const property = room ? propertyMap.get(room.property_id) : null;
    const status = invoice.status as InvoiceModel["status"];

    return {
      ...invoice,
      amount: Number(invoice.amount),
      tenant_name: tenant?.name ?? "-",
      tenant_phone: tenant?.phone ?? "-",
      room_number: room?.room_number ?? "-",
      property_name: property?.name ?? "-",
      display_status: getInvoiceDisplayStatus(status, invoice.due_date, today),
    };
  });

  let filtered = result;

  if (filters?.search?.trim()) {
    const keyword = filters.search.trim().toLowerCase();

    filtered = filtered.filter((invoice) =>
      [
        invoice.invoice_number,
        invoice.tenant_name,
        invoice.tenant_phone,
        invoice.room_number,
        invoice.property_name,
      ].some((value) => value.toLowerCase().includes(keyword)),
    );
  }

  if (filters?.status) {
    filtered = filtered.filter(
      (invoice) => invoice.display_status === filters.status,
    );
  }

  if (filters?.billing_period) {
    filtered = filtered.filter(
      (invoice) =>
        invoice.billing_period.slice(0, 7) === filters.billing_period,
    );
  }

  return filtered;
}

export async function getInvoiceById(
  invoiceId: string,
): Promise<InvoiceModel | null> {
  const invoices = await getInvoices();

  return invoices.find((invoice) => invoice.id === invoiceId) ?? null;
}
