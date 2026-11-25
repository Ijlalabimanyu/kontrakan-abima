"use client";

import {
  BankOutlined,
  HomeOutlined,
  TeamOutlined,
  WalletOutlined,
  DollarOutlined,
  RiseOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { Badge, StatCard } from "@/components/ui";
import type { DashboardKpi } from "@/services/dashboard/interface";

interface DashboardKpiGridProps {
  kpi: DashboardKpi;
}

function formatCompactCurrency(value: number): string {
  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absoluteValue >= 1_000_000_000) {
    return `${sign}Rp${(absoluteValue / 1_000_000_000).toFixed(1)} M`;
  }

  if (absoluteValue >= 1_000_000) {
    return `${sign}Rp${(absoluteValue / 1_000_000).toFixed(1)} jt`;
  }

  if (absoluteValue >= 1_000) {
    return `${sign}Rp${(absoluteValue / 1_000).toFixed(0)} rb`;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardKpiGrid({ kpi }: DashboardKpiGridProps) {
  const stats = [
    {
      title: "Total Properti",
      value: kpi.total_properties,
      icon: <BankOutlined />,
      iconTone: "neutral" as const,
      description: <Badge tone="neutral">Properti</Badge>,
    },
    {
      title: "Total Kamar",
      value: kpi.total_rooms,
      icon: <HomeOutlined />,
      iconTone: "brand" as const,
      description: <Badge tone="brand">{kpi.occupancy_rate}% okupansi</Badge>,
    },
    {
      title: "Penyewa Aktif",
      value: kpi.active_tenants,
      icon: <TeamOutlined />,
      iconTone: "success" as const,
      description: <Badge tone="success">Aktif</Badge>,
    },
    {
      title: "Kamar Tersedia",
      value: kpi.available_rooms,
      icon: <InboxOutlined />,
      iconTone: "warning" as const,
      description: <Badge tone="warning">Siap disewakan</Badge>,
    },
    {
      title: "Pemasukan Bulan Ini",
      value: formatCompactCurrency(kpi.income_this_month),
      icon: <WalletOutlined />,
      iconTone: "success" as const,
      description: <Badge tone="success">Aktual</Badge>,
    },
    {
      title: "Pengeluaran Bulan Ini",
      value: formatCompactCurrency(kpi.expenses_this_month),
      icon: <DollarOutlined />,
      iconTone: "warning" as const,
      description: <Badge tone="warning">Aktual</Badge>,
    },
    {
      title: "Net Profit Bulan Ini",
      value: formatCompactCurrency(kpi.net_profit_this_month),
      icon: <RiseOutlined />,
      iconTone:
        kpi.net_profit_this_month >= 0
          ? ("success" as const)
          : ("danger" as const),
      description: (
        <Badge tone={kpi.net_profit_this_month >= 0 ? "success" : "danger"}>
          {kpi.net_profit_this_month >= 0 ? "Positif" : "Negatif"}
        </Badge>
      ),
    },
    {
      title: "Total Piutang",
      value: formatCompactCurrency(kpi.outstanding_receivables),
      icon: <InboxOutlined />,
      iconTone:
        kpi.overdue_invoices > 0 ? ("danger" as const) : ("neutral" as const),
      description: (
        <Badge tone={kpi.overdue_invoices > 0 ? "danger" : "neutral"}>
          {kpi.overdue_invoices} terlambat
        </Badge>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </div>
  );
}
