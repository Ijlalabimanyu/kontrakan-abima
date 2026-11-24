import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kontrakan Abima Management",
  description: "Property management system Kontrakan Abima",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <Suspense fallback={null}>
          <AntdRegistry>{children}</AntdRegistry>
        </Suspense>
      </body>
    </html>
  );
}
