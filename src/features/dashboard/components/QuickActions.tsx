"use client";

import Link from "next/link";
import {
  BankOutlined,
  TeamOutlined,
  FileAddOutlined,
  WalletOutlined,
  BarChartOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Card } from "@/components/ui";
import { ArrowDownUpIcon } from "lucide-react";
import type { ReactNode } from "react";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
}

const actions: QuickAction[] = [
  {
    label: "Tambah Properti",
    description: "Daftarkan properti baru.",
    href: "/properties",
    icon: <BankOutlined />,
  },
  {
    label: "Tambah Penyewa",
    description: "Kelola informasi penyewa.",
    href: "/tenants",
    icon: <TeamOutlined />,
  },
  {
    label: "Buat Invoice",
    description: "Buat tagihan sewa baru.",
    href: "/invoices",
    icon: <FileAddOutlined />,
  },
  {
    label: "Catat Pengeluaran",
    description: "Input biaya operasional.",
    href: "/finance",
    icon: <WalletOutlined />,
  },
  {
    label: "Laporan Keuangan",
    description: "Lihat performa keuangan.",
    href: "/reports",
    icon: <BarChartOutlined />,
  },
  {
    label: "Maintenance",
    description: "Kelola laporan perbaikan.",
    href: "/maintenance",
    icon: <ToolOutlined />,
  },
];

export default function QuickActions() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Akses Cepat</h2>

        <p className="mt-1 text-sm text-muted">
          Akses fitur yang sering digunakan.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={[
              "group block h-full rounded-lg",
              "focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-brand-primary",
              "focus-visible:ring-offset-2",
            ].join(" ")}
          >
            <Card
              hoverable
              className="h-full !transition-all"
              styles={{ body: { padding: 16 } }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-lg text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                  {action.icon}
                </div>

                <ArrowDownUpIcon className="text-xs text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {action.label}
                </p>

                <p className="text-xs leading-5 text-muted">
                  {action.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
