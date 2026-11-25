"use client";

import { useState } from "react";
import { Layout } from "antd";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import MobileNavigation from "./MobileNavigation";
import type { PropertyOption } from "./PropertySwitcher";
import Drawer from "@/components/ui/Drawer";

const { Content } = Layout;

interface DashboardLayoutProps {
  children: React.ReactNode;
  email: string;
  properties?: PropertyOption[];
  selectedPropertyId?: string;
  onPropertyChange?: (propertyId: string) => void;
}

export default function DashboardLayout({
  children,
  email,
  properties = [],
  selectedPropertyId,
  onPropertyChange,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Layout hasSider className="min-h-screen bg-background!">
        {/* Desktop Sidebar */}
        <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />

        {/* Main Content */}
        <Layout className="min-w-0 bg-background!">
          <AppHeader
            email={email}
            collapsed={collapsed}
            onToggle={() => setCollapsed((previous) => !previous)}
            onMobileMenuToggle={() => setMobileMenuOpen(true)}
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onPropertyChange={onPropertyChange}
          />

          <Content className="min-h-[calc(100vh-64px)] min-w-0 bg-background px-4 py-5 pb-24 md:px-6 md:py-6 md:pb-6 xl:px-8 xl:py-8">
            {children}
          </Content>
        </Layout>

        {/* Mobile Sidebar Drawer */}
        <Drawer
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          placement="left"
          size={288}
          title={null}
          closable={false}
          destroyOnHidden
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          <AppSidebar
            collapsed={false}
            onCollapse={() => undefined}
            mobile
            onNavigate={() => setMobileMenuOpen(false)}
            onClose={() => setMobileMenuOpen(false)}
          />
        </Drawer>
      </Layout>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />
    </>
  );
}
