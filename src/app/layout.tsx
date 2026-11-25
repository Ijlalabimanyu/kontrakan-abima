import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Suspense } from "react";
import { Manrope } from "next/font/google";

import AppProviders from "@/components/layouts/AppProviders";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rumaio",
  description: "Property Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${manrope.variable} antialiased`}>
        <Suspense fallback={null}>
          <AntdRegistry>
            <AppProviders>{children}</AppProviders>
          </AntdRegistry>
        </Suspense>
      </body>
    </html>
  );
}
