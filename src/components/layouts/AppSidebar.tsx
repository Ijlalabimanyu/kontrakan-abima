"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";

import {
  AppstoreOutlined,
  BankOutlined,
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  WalletOutlined,
  BarChartOutlined,
  VideoCameraOutlined,
  ToolOutlined,
  SettingOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import Button from "@/components/ui/Button";
import Image from "next/image";

const { Sider } = Layout;

interface NavigationRoute {
  key: string;
  label: string;
}

const navigationRoutes: NavigationRoute[] = [
  { key: "/dashboard", label: "Dashboard" },
  { key: "/properties", label: "Properti" },
  { key: "/rooms", label: "Kamar" },
  { key: "/tenants", label: "Penyewa" },
  { key: "/contracts", label: "Kontrak" },
  { key: "/invoices", label: "Invoice" },
  { key: "/payments", label: "Pembayaran" },
  { key: "/finance", label: "Keuangan" },
  { key: "/reports", label: "Laporan" },
  { key: "/cctv", label: "CCTV" },
  { key: "/maintenance", label: "Maintenance" },
  { key: "/settings", label: "Pengaturan" },
];

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mobile?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}

export default function AppSidebar({
  collapsed,
  onCollapse,
  mobile = false,
  onNavigate,
  onClose,
}: AppSidebarProps) {
  const pathname = usePathname();

  const selectedRoute = navigationRoutes
    .filter(
      (route) =>
        pathname === route.key ||
        (route.key !== "/dashboard" && pathname.startsWith(`${route.key}/`)),
    )
    .sort((a, b) => b.key.length - a.key.length)[0];

  const selectedKey = selectedRoute?.key ?? "/dashboard";

  const createMenuItem = (
    key: string,
    label: string,
    icon: React.ReactNode,
  ) => ({
    key,
    icon,
    label: (
      <Link href={key} onClick={onNavigate}>
        {label}
      </Link>
    ),
  });

  const menuItems: MenuProps["items"] = [
    {
      type: "group",
      label: "OVERVIEW",
      children: [
        createMenuItem("/dashboard", "Dashboard", <AppstoreOutlined />),
      ],
    },
    {
      type: "group",
      label: "PROPERTY MANAGEMENT",
      children: [
        createMenuItem("/properties", "Properti", <BankOutlined />),
        createMenuItem("/rooms", "Kamar", <HomeOutlined />),
        createMenuItem("/tenants", "Penyewa", <TeamOutlined />),
        createMenuItem("/contracts", "Kontrak", <FileTextOutlined />),
      ],
    },
    {
      type: "group",
      label: "FINANCE",
      children: [
        createMenuItem("/invoices", "Invoice", <FileTextOutlined />),
        createMenuItem("/payments", "Pembayaran", <WalletOutlined />),
        createMenuItem("/finance", "Keuangan", <BankOutlined />),
        createMenuItem("/reports", "Laporan", <BarChartOutlined />),
      ],
    },
    {
      type: "group",
      label: "OPERATIONS",
      children: [
        createMenuItem("/cctv", "CCTV", <VideoCameraOutlined />),
        createMenuItem("/maintenance", "Maintenance", <ToolOutlined />),
      ],
    },
    {
      type: "group",
      label: "PREFERENCES",
      children: [
        createMenuItem("/settings", "Pengaturan", <SettingOutlined />),
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col bg-surface">
      {/* Brand */}

      {/* Brand */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-border ${
          !mobile && collapsed ? "justify-center px-0" : "justify-between px-3"
        }`}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-label="Rumaio Dashboard"
          className={`flex min-w-0 items-center ${
            !mobile && collapsed ? "justify-center" : "flex-1 gap-2"
          }`}
        >
          <Image
            src="/images/rumaio-icon.png"
            alt="Rumaio"
            width={40}
            height={40}
            priority
            className="h-10 w-10 shrink-0 object-contain"
          />

          {(!collapsed || mobile) && (
            <div className="flex min-w-0 flex-col justify-center">
              <span className="text-[17px] font-extrabold leading-5 tracking-[0.04em] text-brand-primary">
                RUMAIO
              </span>

              <span className="mt-0.5 whitespace-nowrap text-[7px] font-semibold leading-3 tracking-[0.13em] text-muted">
                PROPERTY MANAGEMENT
              </span>
            </div>
          )}
        </Link>

        {mobile && onClose && (
          <Button
            variant="ghost"
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
            aria-label="Tutup navigasi"
            className="ml-auto shrink-0"
          />
        )}
      </div>

      {/* Navigation */}
      <Menu
        mode="inline"
        theme="light"
        selectedKeys={[selectedKey]}
        inlineCollapsed={!mobile && collapsed}
        items={menuItems}
        className="ka-sidebar-menu min-h-0 min-w-0 flex-1 overflow-y-auto border-none! py-3!"
      />

      {/* Sidebar Footer */}
      {(!collapsed || mobile) && (
        <div className="shrink-0 border-t border-border p-4">
          <div>
            <p className="text-xs font-semibold text-foreground">
              Kontrakan Abima
            </p>
            <p className="mt-1 text-[11px] text-muted">Owner Workspace</p>
          </div>
        </div>
      )}
    </div>
  );

  if (mobile) {
    return <aside className="h-full w-full bg-surface">{sidebarContent}</aside>;
  }

  return (
    <Sider
      width={180}
      collapsedWidth={80}
      collapsed={collapsed}
      collapsible
      trigger={null}
      onCollapse={onCollapse}
      theme="light"
      className="sticky! top-0! hidden! h-screen! shrink-0! overflow-hidden! border-r! border-border! bg-surface! md:flex!"
    >
      {sidebarContent}
    </Sider>
  );
}
