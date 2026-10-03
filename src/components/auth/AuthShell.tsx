import { Wallet } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Moldura comum das telas de login, cadastro e senha. */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-8 text-zinc-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#FF7A00]/15 text-[#FF7A00]">
              <Wallet className="size-6" aria-hidden="true" />
            </div>
            <p className="mt-5 text-sm font-medium text-[#FF7A00]">Mil</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#111113] p-5 shadow-2xl shadow-black/20 sm:p-6">{children}</div>

          <p className="mt-6 text-center text-xs text-zinc-600">
            <Link href="/privacy" className="hover:text-zinc-400">Privacidade</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/terms" className="hover:text-zinc-400">Termos de uso</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export const authInputClass =
  "h-12 w-full rounded-xl border border-zinc-800 bg-[#18181B] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20";

export const authButtonClass =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113] disabled:cursor-not-allowed disabled:opacity-60";
