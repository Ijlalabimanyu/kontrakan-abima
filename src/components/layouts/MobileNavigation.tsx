"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppstoreOutlined,
  BankOutlined,
  WalletOutlined,
  MoreOutlined,
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  VideoCameraOutlined,
  ToolOutlined,
  SettingOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import Drawer from "@/components/ui/Drawer";

const primaryItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <AppstoreOutlined />,
  },
  {
    href: "/properties",
    label: "Properti",
    icon: <BankOutlined />,
  },
  {
    href: "/finance",
    label: "Keuangan",
    icon: <WalletOutlined />,
  },
];

const moreSections = [
  {
    title: "PROPERTY MANAGEMENT",
    items: [
      {
        href: "/rooms",
        label: "Kamar",
        icon: <HomeOutlined />,
      },
      {
        href: "/tenants",
        label: "Penyewa",
        icon: <TeamOutlined />,
      },
      {
        href: "/contracts",
        label: "Kontrak",
        icon: <FileTextOutlined />,
      },
      {
        href: "/invoices",
        label: "Invoice",
        icon: <FileTextOutlined />,
      },
      {
        href: "/payments",
        label: "Pembayaran",
        icon: <WalletOutlined />,
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        href: "/reports",
        label: "Laporan",
        icon: <BarChartOutlined />,
      },
      {
        href: "/cctv",
        label: "CCTV",
        icon: <VideoCameraOutlined />,
      },
      {
        href: "/maintenance",
        label: "Maintenance",
        icon: <ToolOutlined />,
      },
      {
        href: "/settings",
        label: "Pengaturan",
        icon: <SettingOutlined />,
      },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  return (
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`))
  );
}

export default function MobileNavigation() {
  const pathname = usePathname();

  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = moreSections.some((section) =>
    section.items.some((item) => isActivePath(pathname, item.href)),
  );

  return (
    <>
      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-4">
          {primaryItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex flex-col items-center justify-center gap-1",
                  "rounded-lg text-[11px] font-medium transition-colors",
                  active ? "text-brand-primary" : "text-muted",
                ].join(" ")}
              >
                <span className="text-xl">{item.icon}</span>

                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            aria-label="Buka menu lainnya"
            className={[
              "flex flex-col items-center justify-center gap-1",
              "rounded-lg text-[11px] font-medium",
              moreActive ? "text-brand-primary" : "text-muted",
            ].join(" ")}
          >
            <span className="text-xl">
              <MoreOutlined />
            </span>

            <span>Lainnya</span>
          </button>
        </div>
      </nav>

      <Drawer
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        placement="bottom"
        size="min(75vh, 560px)"
        title="Menu lainnya"
        closeIcon={<CloseOutlined />}
        className="md:hidden!"
        styles={{
          body: {
            padding: 16,
          },
        }}
      >
        <div className="space-y-6">
          {moreSections.map((section) => (
            <section key={section.title}>
              <h3 className="mb-3 text-[11px] font-bold tracking-wider text-muted">
                {section.title}
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {section.items.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "flex min-h-12 items-center gap-3",
                        "rounded-lg border p-3 text-sm font-medium",
                        active
                          ? "border-brand-primary bg-brand-soft text-brand-primary"
                          : "border-border bg-surface text-foreground",
                      ].join(" ")}
                    >
                      <span className="text-lg">{item.icon}</span>

                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </Drawer>
    </>
  );
}
