import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#09090B] px-4 text-zinc-100">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]">
          <SearchX className="size-6" aria-hidden="true" />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-white">
          Página não encontrada
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          A página que você está procurando não existe
          ou não está mais disponível.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A]"
        >
          Voltar para o dashboard
        </Link>
      </div>
    </div>
  );
}
