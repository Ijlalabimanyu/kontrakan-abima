"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Typography } from "antd";
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
} from "@ant-design/icons";

const { Sider } = Layout;

const menuItems = [
  {
    key: "/dashboard",
    icon: <AppstoreOutlined />,
    label: <Link href="/dashboard">Dashboard</Link>,
  },
  {
    key: "/properties",
    icon: <BankOutlined />,
    label: <Link href="/properties">Properti</Link>,
  },
  {
    key: "/rooms",
    icon: <HomeOutlined />,
    label: <Link href="/rooms">Kamar</Link>,
  },
  {
    key: "/tenants",
    icon: <TeamOutlined />,
    label: <Link href="/tenants">Penyewa</Link>,
  },
  {
    key: "/contracts",
    icon: <FileTextOutlined />,
    label: <Link href="/contracts">Kontrak</Link>,
  },
  {
    key: "/invoices",
    icon: <FileTextOutlined />,
    label: <Link href="/invoices">Invoice</Link>,
  },
  {
    key: "/payments",
    icon: <WalletOutlined />,
    label: <Link href="/payments">Pembayaran</Link>,
  },
  {
    key: "/finance",
    icon: <BankOutlined />,
    label: <Link href="/finance">Keuangan</Link>,
  },
  {
    key: "/reports",
    icon: <BarChartOutlined />,
    label: <Link href="/reports">Laporan</Link>,
  },
  {
    key: "/cctv",
    icon: <VideoCameraOutlined />,
    label: <Link href="/cctv">CCTV</Link>,
  },
  {
    key: "/maintenance",
    icon: <ToolOutlined />,
    label: <Link href="/maintenance">Maintenance</Link>,
  },
  {
    key: "/settings",
    icon: <SettingOutlined />,
    label: <Link href="/settings">Pengaturan</Link>,
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  mobile?: boolean;
}

export default function AppSidebar({
  collapsed,
  onCollapse,
  mobile = false,
}: AppSidebarProps) {
  const pathname = usePathname();

  const selectedKey =
    menuItems.find(
      (item) =>
        pathname === item.key ||
        (item.key !== "/dashboard" && pathname.startsWith(`${item.key}/`)),
    )?.key ?? "/dashboard";

  return (
    <Sider
      width={250}
      collapsedWidth={mobile ? 0 : 80}
      collapsed={collapsed}
      collapsible={!mobile}
      trigger={null}
      onCollapse={onCollapse}
      theme="light"
      className="!border-r !border-slate-200"
    >
      <div className="flex h-16 items-center justify-center border-b border-slate-200">
        <Typography.Title level={5} className="!mb-0">
          {collapsed ? "KA" : "Kontrakan Abima"}
        </Typography.Title>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        className="!mt-4 !border-none"
      />
    </Sider>
  );
}
