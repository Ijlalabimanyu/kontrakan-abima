"use client";

import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import type { ThemeConfig } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import idID from "antd/locale/id_ID";

dayjs.locale("id");

interface AppProvidersProps {
  children: ReactNode;
}

const antdTheme: ThemeConfig = {
  token: {
    // Brand colors
    colorPrimary: "#173F35",
    colorInfo: "#2E6654",
    colorSuccess: "#2D7B57",
    colorWarning: "#B77A2B",
    colorError: "#B84D4D",

    // Text
    colorTextBase: "#202C26",
    colorTextSecondary: "#68756D",

    // Background
    colorBgBase: "#FFFFFF",
    colorBgLayout: "#F6F4EE",
    colorBgContainer: "#FFFFFF",

    // Border
    colorBorder: "#E6E3D9",
    colorBorderSecondary: "#E6E3D9",

    // Typography
    fontFamily: "var(--font-manrope), Arial, sans-serif",
    fontSize: 14,

    // Shape
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,

    // Controls
    controlHeight: 44,
    controlHeightSM: 36,
    controlHeightLG: 48,
  },
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ConfigProvider locale={idID} theme={antdTheme}>
      {children}
    </ConfigProvider>
  );
}
