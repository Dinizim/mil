import { Zap } from "lucide-react";

import { getCategories } from "@/services/category.services";

import QuickEntryForm from "./QuickEntryForm";

export default async function QuickEntryPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-xl">
        <header>
          <div className="flex items-center gap-2 text-[#FF7A00]">
            <Zap className="size-5" aria-hidden="true" />
            <span className="text-sm font-medium">Lançamento rápido</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">O que aconteceu?</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Escreva do seu jeito: <span className="text-zinc-200">mercado 85</span>,{" "}
            <span className="text-zinc-200">uber 23,50</span> ou <span className="text-zinc-200">+salário 3000</span>.
          </p>
        </header>

        <QuickEntryForm categories={categories} />
      </div>
    </main>
  );
}
