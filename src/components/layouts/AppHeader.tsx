"use client";

import { Button, Avatar, Typography, Space } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { signOut } from "@/services/auth/actions";

interface AppHeaderProps {
  email: string;
  collapsed: boolean;
  onToggle: () => void;
}

export default function AppHeader({
  email,
  collapsed,
  onToggle,
}: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
      />

      <Space size="middle">
        <div className="hidden text-right sm:block">
          <Typography.Text strong>Pemilik</Typography.Text>
          <br />
          <Typography.Text type="secondary" className="text-xs">
            {email}
          </Typography.Text>
        </div>

        <Avatar icon={<UserOutlined />} />

        <form action={signOut}>
          <Button
            htmlType="submit"
            type="text"
            danger
            icon={<LogoutOutlined />}
            title="Logout"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </form>
      </Space>
    </header>
  );
}
