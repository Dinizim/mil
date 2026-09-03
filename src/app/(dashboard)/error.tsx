"use client";

import { useEffect } from "react";
import { Info } from "lucide-react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({
  error,
  reset,
}: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090B] px-4 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#111113] p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-rose-400/10 text-rose-400">
          <Info className="size-6" aria-hidden="true" />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-white">
          Algo deu errado
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Não foi possível carregar esta página.
          Tente novamente. Se o problema continuar,
          verifique sua conexão ou tente mais tarde.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 min-h-11 rounded-xl bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00]"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
