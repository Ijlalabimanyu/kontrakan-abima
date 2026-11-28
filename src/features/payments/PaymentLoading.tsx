export default function PaymentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded-lg bg-slate-200" />
          <div className="h-4 w-72 rounded-lg bg-slate-100" />
        </div>

        <div className="h-10 w-44 rounded-lg bg-slate-200" />
      </div>

      <div className="rounded-2xl border border-[#E6E3D9] bg-white p-5">
        <div className="mb-5 space-y-2">
          <div className="h-5 w-40 rounded-lg bg-slate-200" />
          <div className="h-4 w-52 rounded-lg bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-10 rounded-lg bg-slate-100" />
          ))}
        </div>

        <div className="mt-5 hidden space-y-3 md:block">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 rounded-lg bg-slate-100" />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-48 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
