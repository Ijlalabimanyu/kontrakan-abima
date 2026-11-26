"use client";

import { Alert } from "antd";
import { Button } from "@/components/ui";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ reset }: DashboardErrorProps) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Alert
          type="error"
          showIcon
          title="Dashboard gagal dimuat"
          description="Terjadi kendala saat mengambil data dashboard. Silakan coba kembali."
        />

        <div className="flex justify-center">
          <Button onClick={reset}>Coba Lagi</Button>
        </div>
      </div>
    </main>
  );
}
