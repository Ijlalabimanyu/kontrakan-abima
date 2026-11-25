import { Suspense } from "react";
import { connection } from "next/server";

import SettingsPageClient from "@/features/settings/SettingsPageClient";
import { getSettingsPageData } from "@/services/settings/service";

async function SettingsContent() {
  await connection();

  return <SettingsPageClient data={await getSettingsPageData()} />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}
