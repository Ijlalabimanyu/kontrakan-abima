export default function FinanceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="h-7 w-36 rounded-lg bg-slate-200" />
          <div className="h-4 w-80 max-w-full rounded-lg bg-slate-100" />
        </div>
        <div className="h-10 w-48 rounded-lg bg-slate-200" />
      </div>

      <div className="rounded-2xl border border-[#E6E3D9] bg-white p-4 sm:p-5">
        <div className="mb-5 flex gap-5 border-b border-[#E6E3D9] pb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-5 w-24 shrink-0 rounded-lg bg-slate-200"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-slate-100" />
          ))}
        </div>

        <div className="mt-6 h-56 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
