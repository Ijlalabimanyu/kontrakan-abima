export interface DashboardKpi {
  total_properties: number;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  maintenance_rooms: number;
  occupancy_rate: number;
  active_tenants: number;
  income_this_month: number;
  expenses_this_month: number;
  net_profit_this_month: number;
  outstanding_receivables: number;
  overdue_invoices: number;
}

export interface PropertyOccupancy {
  property_id: string;
  property_name: string;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  maintenance_rooms: number;
  occupancy_rate: number;
}

export interface DashboardFinancialTrend {
  month: string;
  label: string;
  income: number;
  expenses: number;
  net_profit: number;
}

export interface DashboardReceivable {
  id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string;
  status: "UNPAID" | "PARTIAL" | "OVERDUE";
}

export interface DashboardMaintenance {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: "OPEN" | "IN_PROGRESS";
  reported_at: string;
  property_name: string;
  room_number: string | null;
}

export type DashboardActivityType = "PAYMENT" | "EXPENSE" | "MAINTENANCE";

export interface DashboardActivity {
  id: string;
  type: DashboardActivityType;
  title: string;
  description: string;
  amount: number | null;
  date: string;
}

export interface DashboardAnalytics {
  generated_at: string;
  timezone: string;
  kpi: DashboardKpi;
  property_occupancy: PropertyOccupancy[];
  financial_trends: DashboardFinancialTrend[];
  receivables: DashboardReceivable[];
  maintenance: DashboardMaintenance[];
  activities: DashboardActivity[];
}
