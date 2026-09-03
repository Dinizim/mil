export default function Loading() {
  return (
    <div className="min-h-screen space-y-6 bg-[#09090B] p-4 animate-pulse sm:p-6">
      {/* Cabeçalho */}
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-lg bg-zinc-800" />
        <div className="h-4 w-64 rounded-lg bg-zinc-900" />
      </div>

      {/* Cards financeiros */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-zinc-800 bg-[#111113] p-5"
          >
            <div className="h-4 w-24 rounded bg-zinc-800" />

            <div className="mt-4 h-7 w-32 rounded-lg bg-zinc-800" />

            <div className="mt-3 h-3 w-20 rounded bg-zinc-900" />
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-5">
          <div className="h-5 w-40 rounded bg-zinc-800" />

          <div className="mt-6 h-[280px] rounded-xl bg-zinc-900" />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-5">
          <div className="h-5 w-40 rounded bg-zinc-800" />

          <div className="mt-6 h-[280px] rounded-xl bg-zinc-900" />
        </div>
      </div>

      {/* Metas */}
      <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-5">
        <div className="h-5 w-32 rounded bg-zinc-800" />

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="h-36 rounded-xl bg-zinc-900" />
          <div className="h-36 rounded-xl bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}
