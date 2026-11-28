export default function ContractsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-52 rounded-lg bg-slate-200" />
        <div className="h-4 w-80 max-w-full rounded-lg bg-slate-100" />
      </div>

      <div className="rounded-2xl border border-[#E6E3D9] bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row">
          <div className="h-6 w-44 rounded-lg bg-slate-200" />
          <div className="h-10 w-36 rounded-lg bg-slate-200" />
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
          <div className="h-10 rounded-lg bg-slate-100" />
          <div className="h-10 rounded-lg bg-slate-100" />
        </div>

        <div className="hidden space-y-3 md:block">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 rounded-lg bg-slate-100" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-44 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
