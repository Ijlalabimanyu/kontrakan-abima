import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/layouts/DashboardLayout";

async function ProtectedContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connection();

  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/login");
  }

  return (
    <DashboardLayout email={String(claims.email ?? "")}>
      {children}
    </DashboardLayout>
  );
}

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <ProtectedContent>{children}</ProtectedContent>
    </Suspense>
  );
}
