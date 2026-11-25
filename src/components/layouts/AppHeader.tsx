"use client";

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { Avatar, Typography } from "antd";
import { signOut } from "@/services/auth/actions";
import Button from "@/components/ui/Button";
import PropertySwitcher from "./PropertySwitcher";
import type { PropertyOption } from "./PropertySwitcher";

interface AppHeaderProps {
  email: string;
  collapsed: boolean;
  onToggle: () => void;
  onMobileMenuToggle?: () => void;
  properties?: PropertyOption[];
  selectedPropertyId?: string;
  onPropertyChange?: (propertyId: string) => void;
}

export default function AppHeader({
  email,
  collapsed,
  onToggle,
  onMobileMenuToggle,
  properties = [],
  selectedPropertyId,
  onPropertyChange,
}: AppHeaderProps) {
  const showPropertySwitcher =
    properties.length > 0 && Boolean(onPropertyChange);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur-md md:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="small"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="hidden! md:inline-flex!"
        />

        <Button
          variant="ghost"
          size="small"
          icon={<MenuOutlined />}
          onClick={onMobileMenuToggle ?? onToggle}
          aria-label="Buka navigasi"
          className="inline-flex! md:hidden!"
        />

        {showPropertySwitcher && (
          <div className="hidden min-w-0 lg:block">
            <PropertySwitcher
              properties={properties}
              value={selectedPropertyId}
              onChange={onPropertyChange!}
            />
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <Typography.Text strong className="block! text-xs! text-foreground!">
            Pemilik
          </Typography.Text>

          <Typography.Text
            type="secondary"
            className="block! max-w-48 truncate text-xs!"
          >
            {email}
          </Typography.Text>
        </div>

        <Avatar
          size={36}
          icon={<UserOutlined />}
          className="bg-brand-soft! text-brand-primary!"
        />

        <form action={signOut}>
          <Button
            htmlType="submit"
            variant="danger"
            size="small"
            icon={<LogoutOutlined />}
            aria-label="Logout"
          >
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
