"use client";

import { useState } from "react";
import { Layout } from "antd";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

const { Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
  email: string;
}

export default function DashboardLayout({
  children,
  email,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout>
        <AppHeader
          email={email}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <Content className="min-w-0 bg-slate-50 p-4 md:p-6">{children}</Content>
      </Layout>
    </Layout>
  );
}
