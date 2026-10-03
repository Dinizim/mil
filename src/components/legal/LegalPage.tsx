import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatDate } from "@/lib/dates";
import { TERMS_VERSION } from "@/lib/site";

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-8 text-zinc-300 sm:px-6 sm:py-12">
      <article className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Mil
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-zinc-500">Versão de {formatDate(TERMS_VERSION)}</p>
        <div className="mt-8 space-y-8 text-sm leading-7 [&_a]:font-medium [&_a]:text-[#FF7A00] [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </div>
        <p className="mt-12 border-t border-zinc-800 pt-6 text-xs text-zinc-600">
          <Link href="/privacy" className="hover:text-zinc-400">Política de privacidade</Link>
          <span aria-hidden="true"> · </span>
          <Link href="/terms" className="hover:text-zinc-400">Termos de uso</Link>
        </p>
      </article>
    </main>
  );
}

export function ContactLine({ email }: { email: string }) {
  return email ? <a href={`mailto:${email}`}>{email}</a> : <span>pelo canal de contato indicado no app</span>;
}
