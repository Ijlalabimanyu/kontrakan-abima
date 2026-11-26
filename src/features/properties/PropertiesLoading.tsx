import { Card, Skeleton } from "@/components/ui";

export default function PropertiesLoading() {
  return (
    <main
      className="space-y-6"
      aria-label="Memuat data properti"
      aria-busy="true"
    >
      {/* Page Header */}
      <div className="space-y-3">
        <div className="h-7 w-56 animate-pulse rounded-md bg-neutral-soft" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-neutral-soft" />
      </div>

      {/* Table Loading */}
      <Card>
        <div className="space-y-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <div className="h-10 w-full max-w-64 animate-pulse rounded-md bg-neutral-soft" />
            <div className="h-10 w-36 animate-pulse rounded-md bg-neutral-soft" />
          </div>

          <Skeleton active title={false} paragraph={{ rows: 6 }} />
        </div>
      </Card>
    </main>
  );
}
