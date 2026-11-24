import { Suspense } from "react";
import { connection } from "next/server";

import SettingsPageClient from "@/features/settings/components/SettingsPageClient";
import { getSettingsPageData } from "@/features/settings/services/settings.service";

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
