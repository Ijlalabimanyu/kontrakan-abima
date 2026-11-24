import { createClient } from "@/lib/supabase/server";

import {
  DashboardAnalytics,
  DashboardActivity,
  DashboardFinancialTrend,
  DashboardMaintenance,
  DashboardReceivable,
  PropertyOccupancy,
} from "../interfaces/dashboard.interface";

const PAGE_SIZE = 1000;

async function fetchAllRows<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{
    data: T[] | null;
    error: { message: string } | null;
  }>,
): Promise<T[]> {
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(error.message);

    const page = data ?? [];
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;

    from += PAGE_SIZE;
  }

  return rows;
}

function getDateInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function getMonthKey(date: string): string {
  return date.slice(0, 7);
}

function getLastSixMonths(currentDate: string): DashboardFinancialTrend[] {
  const [year, month] = currentDate.slice(0, 7).split("-").map(Number);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1 - (5 - index), 1));

    const monthKey = [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
    ].join("-");

    return {
      month: monthKey,
      label: new Intl.DateTimeFormat("id-ID", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }).format(date),
      income: 0,
      expenses: 0,
      net_profit: 0,
    };
  });
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Sesi pengguna tidak valid");
  }

  // Ambil preferensi timezone milik owner.
  const { data: settings, error: settingsError } = await supabase
    .from("owner_settings")
    .select("timezone")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (settingsError) {
    throw new Error(settingsError.message);
  }

  const timezone = settings?.timezone ?? "Asia/Jakarta";
  const today = getDateInTimezone(new Date(), timezone);
  const currentMonth = getMonthKey(today);

  // Ambil seluruh data dengan pagination.
  const [
    properties,
    rooms,
    contracts,
    payments,
    expenses,
    invoices,
    maintenanceRows,
  ] = await Promise.all([
    fetchAllRows((from, to) =>
      supabase
        .from("properties")
        .select("id, name")
        .eq("owner_id", user.id)
        .range(from, to),
    ),

    fetchAllRows((from, to) =>
      supabase
        .from("rooms")
        .select("id, property_id, room_number, status")
        .eq("owner_id", user.id)
        .range(from, to),
    ),

    fetchAllRows((from, to) =>
      supabase
        .from("rental_contracts")
        .select("id, room_id, tenant_id, start_date, status")
        .eq("owner_id", user.id)
        .eq("status", "ACTIVE")
        .lte("start_date", today)
        .range(from, to),
    ),

    fetchAllRows((from, to) =>
      supabase
        .from("rental_invoice_payments")
        .select("id, payment_number, invoice_id, amount, payment_date")
        .eq("owner_id", user.id)
        .order("payment_date", { ascending: false })
        .range(from, to),
    ),

    fetchAllRows((from, to) =>
      supabase
        .from("expenses")
        .select(
          "id, expense_number, category, description, amount, expense_date",
        )
        .eq("owner_id", user.id)
        .order("expense_date", { ascending: false })
        .range(from, to),
    ),

    fetchAllRows((from, to) =>
      supabase
        .from("rental_invoices")
        .select("id, invoice_number, amount, due_date, status")
        .eq("owner_id", user.id)
        .in("status", ["UNPAID", "PARTIAL"])
        .range(from, to),
    ),

    fetchAllRows((from, to) =>
      supabase
        .from("maintenance_requests")
        .select(
          "id, property_id, room_id, title, category, priority, status, reported_at",
        )
        .eq("owner_id", user.id)
        .in("status", ["OPEN", "IN_PROGRESS"])
        .order("reported_at", { ascending: false })
        .range(from, to),
    ),
  ]);

  // -------------------------------------------------------
  // 1. Occupancy
  // -------------------------------------------------------

  const occupiedRoomIds = new Set(
    contracts.map((contract) => contract.room_id),
  );

  const activeTenantIds = new Set(
    contracts.map((contract) => contract.tenant_id),
  );

  const occupiedRooms = rooms.filter((room) => occupiedRoomIds.has(room.id));

  const maintenanceRooms = rooms.filter(
    (room) => room.status === "MAINTENANCE",
  );

  const availableRooms = rooms.filter(
    (room) => !occupiedRoomIds.has(room.id) && room.status === "AVAILABLE",
  );

  const occupancyRate = rooms.length
    ? Number(((occupiedRooms.length / rooms.length) * 100).toFixed(1))
    : 0;

  const propertyMap = new Map(
    properties.map((property) => [property.id, property.name]),
  );

  const roomsByProperty = new Map<string, typeof rooms>();

  rooms.forEach((room) => {
    const list = roomsByProperty.get(room.property_id) ?? [];
    list.push(room);
    roomsByProperty.set(room.property_id, list);
  });

  const propertyOccupancy: PropertyOccupancy[] = properties.map((property) => {
    const propertyRooms = roomsByProperty.get(property.id) ?? [];

    const occupied = propertyRooms.filter((room) =>
      occupiedRoomIds.has(room.id),
    ).length;

    const maintenance = propertyRooms.filter(
      (room) => room.status === "MAINTENANCE",
    ).length;

    const available = propertyRooms.filter(
      (room) => !occupiedRoomIds.has(room.id) && room.status === "AVAILABLE",
    ).length;

    return {
      property_id: property.id,
      property_name: property.name,
      total_rooms: propertyRooms.length,
      occupied_rooms: occupied,
      available_rooms: available,
      maintenance_rooms: maintenance,
      occupancy_rate: propertyRooms.length
        ? Number(((occupied / propertyRooms.length) * 100).toFixed(1))
        : 0,
    };
  });

  // -------------------------------------------------------
  // 2. Financial analytics
  // -------------------------------------------------------

  const paymentRows = payments as {
    id: string;
    payment_number: string;
    invoice_id: string;
    amount: number | string;
    payment_date: string;
  }[];

  const expenseRows = expenses as {
    id: string;
    expense_number: string;
    category: string;
    description: string;
    amount: number | string;
    expense_date: string;
  }[];

  const monthlyIncome = paymentRows
    .filter((payment) => getMonthKey(payment.payment_date) === currentMonth)
    .reduce((total, payment) => total + Number(payment.amount), 0);

  const monthlyExpenses = expenseRows
    .filter((expense) => getMonthKey(expense.expense_date) === currentMonth)
    .reduce((total, expense) => total + Number(expense.amount), 0);

  const trends = getLastSixMonths(today);

  const trendMap = new Map(trends.map((trend) => [trend.month, trend]));

  paymentRows.forEach((payment) => {
    const trend = trendMap.get(getMonthKey(payment.payment_date));

    if (trend) {
      trend.income += Number(payment.amount);
    }
  });

  expenseRows.forEach((expense) => {
    const trend = trendMap.get(getMonthKey(expense.expense_date));

    if (trend) {
      trend.expenses += Number(expense.amount);
    }
  });

  trends.forEach((trend) => {
    trend.net_profit = trend.income - trend.expenses;
  });

  // -------------------------------------------------------
  // 3. Receivables
  // -------------------------------------------------------

  const paidByInvoice = new Map<string, number>();

  paymentRows.forEach((payment) => {
    const current = paidByInvoice.get(payment.invoice_id) ?? 0;

    paidByInvoice.set(payment.invoice_id, current + Number(payment.amount));
  });

  const receivables: DashboardReceivable[] = invoices
    .map((invoice) => {
      const paidAmount = paidByInvoice.get(invoice.id) ?? 0;
      const remaining = Math.max(0, Number(invoice.amount) - paidAmount);

      return {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        amount: Number(invoice.amount),
        paid_amount: paidAmount,
        remaining_amount: remaining,
        due_date: invoice.due_date,
        status: invoice.due_date < today ? "OVERDUE" : invoice.status,
      };
    })
    .filter((invoice) => invoice.remaining_amount > 0)
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const outstandingReceivables = receivables.reduce(
    (total, invoice) => total + invoice.remaining_amount,
    0,
  );

  const overdueInvoices = receivables.filter(
    (invoice) => invoice.status === "OVERDUE",
  ).length;

  // -------------------------------------------------------
  // 4. Maintenance
  // -------------------------------------------------------

  const roomMap = new Map(rooms.map((room) => [room.id, room.room_number]));

  const maintenance: DashboardMaintenance[] = maintenanceRows.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    priority: item.priority,
    status: item.status,
    reported_at: item.reported_at,
    property_name: item.property_id
      ? (propertyMap.get(item.property_id) ?? "-")
      : "-",
    room_number: item.room_id ? (roomMap.get(item.room_id) ?? null) : null,
  }));

  // -------------------------------------------------------
  // 5. Recent activities
  // -------------------------------------------------------

  const invoiceMap = new Map(
    invoices.map((invoice) => [invoice.id, invoice.invoice_number]),
  );

  const activities: DashboardActivity[] = [
    ...paymentRows.map((payment) => ({
      id: `PAY-${payment.id}`,
      type: "PAYMENT" as const,
      title: "Pembayaran diterima",
      description: `Pembayaran ${invoiceMap.get(payment.invoice_id) ?? payment.payment_number}`,
      amount: Number(payment.amount),
      date: payment.payment_date,
    })),

    ...expenseRows.map((expense) => ({
      id: `EXP-${expense.id}`,
      type: "EXPENSE" as const,
      title: "Pengeluaran dicatat",
      description: expense.description,
      amount: Number(expense.amount),
      date: expense.expense_date,
    })),

    ...maintenanceRows.map((item) => ({
      id: `MNT-${item.id}`,
      type: "MAINTENANCE" as const,
      title: "Laporan maintenance baru",
      description: item.title,
      amount: null,
      date: item.reported_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // -------------------------------------------------------
  // 6. Final response
  // -------------------------------------------------------

  return {
    generated_at: new Date().toISOString(),
    timezone,

    kpi: {
      total_properties: properties.length,
      total_rooms: rooms.length,
      occupied_rooms: occupiedRooms.length,
      available_rooms: availableRooms.length,
      maintenance_rooms: maintenanceRooms.length,
      occupancy_rate: occupancyRate,
      active_tenants: activeTenantIds.size,
      income_this_month: monthlyIncome,
      expenses_this_month: monthlyExpenses,
      net_profit_this_month: monthlyIncome - monthlyExpenses,
      outstanding_receivables: outstandingReceivables,
      overdue_invoices: overdueInvoices,
    },

    property_occupancy: propertyOccupancy,
    financial_trends: trends,
    receivables: receivables.slice(0, 5),
    maintenance: maintenance.slice(0, 5),
    activities,
  };
}
