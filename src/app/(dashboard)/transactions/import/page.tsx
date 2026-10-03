import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

import { getCategories } from "@/services/category.services";

import ImportStatement from "./ImportStatement";

export default async function ImportPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/transactions" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Transações
        </Link>
        <header className="mt-4">
          <div className="flex items-center gap-2 text-[#FF7A00]">
            <Upload className="size-5" aria-hidden="true" />
            <span className="text-sm font-medium">Menos digitação</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Importar extrato</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Envie o arquivo OFX ou CSV exportado pelo seu banco. O arquivo é lido no seu navegador; só as transações que você
            confirmar são salvas.
          </p>
        </header>

        <ImportStatement categories={categories} />
      </div>
    </main>
  );
}
