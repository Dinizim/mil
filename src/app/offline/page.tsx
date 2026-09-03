import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090B] px-6 text-white">
      <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#111113] p-8 text-center shadow-2xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#FF7A00]/10 text-xl font-bold text-[#FF7A00]">
          M
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Você está offline</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          O Mil precisa de conexão para carregar esta página. Assim que sua internet voltar, tente novamente.
        </p>
        <Link
          href="/dashboard"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#FF7A00] px-5 text-sm font-semibold text-black transition hover:bg-[#ff8b26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]"
        >
          Tentar novamente
        </Link>
      </section>
    </main>
  );
}
