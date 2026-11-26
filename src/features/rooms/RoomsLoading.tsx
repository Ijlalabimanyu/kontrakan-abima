import { Card, Skeleton } from "@/components/ui";

export default function RoomsLoading() {
  return (
    <main className="space-y-6" aria-label="Memuat data kamar" aria-busy="true">
      {/* Page Heading */}
      <div className="space-y-3">
        <div className="h-7 w-56 animate-pulse rounded-md bg-neutral-soft" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded-md bg-neutral-soft" />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <div className="space-y-3">
              <Skeleton active title={false} paragraph={{ rows: 1 }} />
              <div className="h-8 w-20 animate-pulse rounded-md bg-neutral-soft" />
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="h-5 w-32 animate-pulse rounded-md bg-neutral-soft" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-md bg-neutral-soft"
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Room List */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Card>
        ))}
      </div>
    </main>
  );
}
