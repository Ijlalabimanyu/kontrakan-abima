import { Card } from "@/components/ui";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={["animate-pulse rounded-md bg-neutral-soft", className].join(
        " ",
      )}
    />
  );
}

function DashboardLoading() {
  return (
    <main className="space-y-6" aria-label="Memuat dashboard" aria-busy="true">
      {/* Page Heading */}
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-32" />
        <SkeletonBlock className="h-8 w-52" />
        <SkeletonBlock className="h-4 w-72 max-w-full" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Card key={index}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-3 w-28" />
                <SkeletonBlock className="h-10 w-10 rounded-lg" />
              </div>

              <SkeletonBlock className="h-8 w-32" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          </Card>
        ))}
      </div>

      {/* Occupancy and Financial Trend */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <Card key={index}>
            <div className="space-y-5">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-3 w-64 max-w-full" />
              <SkeletonBlock className="h-52 w-full rounded-lg" />
            </div>
          </Card>
        ))}
      </div>

      {/* Receivables and Maintenance */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <Card key={index}>
            <div className="space-y-5">
              <SkeletonBlock className="h-5 w-44" />

              {Array.from({ length: 3 }, (_, row) => (
                <div key={row} className="space-y-2">
                  <SkeletonBlock className="h-4 w-36" />
                  <SkeletonBlock className="h-3 w-full" />
                  <SkeletonBlock className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Activity and Quick Actions */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <div className="space-y-5">
            <SkeletonBlock className="h-5 w-40" />

            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex gap-3">
                <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-36" />
                  <SkeletonBlock className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="space-y-5">
            <SkeletonBlock className="h-5 w-36" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <SkeletonBlock key={index} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default DashboardLoading;
