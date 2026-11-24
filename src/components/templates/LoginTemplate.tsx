"use client";

import type { ReactNode } from "react";
import { Card, Typography } from "antd";

export default function LoginTemplate({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="mb-8 text-center">
          <Typography.Title level={3}>Kontrakan Abima</Typography.Title>
          <Typography.Text type="secondary">
            Silakan login untuk mengelola kontrakan Anda.
          </Typography.Text>
        </div>
        {children}
      </Card>
    </main>
  );
}
