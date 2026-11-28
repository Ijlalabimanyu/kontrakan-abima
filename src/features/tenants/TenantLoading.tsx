import { Card, Skeleton } from "@/components/ui";

export default function TenantsLoading() {
  return (
    <main
      className="space-y-6"
      aria-label="Memuat data penyewa"
      aria-busy="true"
    >
      <div className="space-y-3">
        <div className="h-7 w-56 animate-pulse rounded-md bg-neutral-soft" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-neutral-soft" />
      </div>

      <Card>
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="h-5 w-36 animate-pulse rounded-md bg-neutral-soft" />
            <div className="h-10 w-full sm:w-40 animate-pulse rounded-md bg-neutral-soft" />
          </div>

          <div className="h-10 w-full max-w-96 animate-pulse rounded-md bg-neutral-soft" />

          <Skeleton active title={false} paragraph={{ rows: 6 }} />
        </div>
      </Card>
    </main>
  );
}
