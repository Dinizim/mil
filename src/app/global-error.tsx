"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#09090B] text-zinc-100">
        <main className="flex min-h-screen items-center justify-center px-4 py-8">
          <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#111113] p-6 text-center shadow-2xl">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-400">
              <span aria-hidden="true" className="text-xl">!</span>
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-white">Algo deu errado</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">O Mil encontrou um erro inesperado. Tente novamente.</p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 min-h-11 rounded-xl bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A]"
            >
              Tentar novamente
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
