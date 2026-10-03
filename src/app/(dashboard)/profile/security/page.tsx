import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { getAuthenticatedUser } from "@/lib/auth";

import PasswordForm from "./PasswordForm";

export default async function SecurityPage() {
  const { user } = await getAuthenticatedUser();
  // Quem entrou só com Google não tem identidade "email" e, portanto, não tem senha.
  const hasPassword = Boolean(user.identities?.some((identity) => identity.provider === "email"));
  const providers = (user.identities ?? []).map((identity) => identity.provider);

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Meu Perfil
        </Link>
        <header className="mt-4 mb-8">
          <div className="flex items-center gap-2 text-[#FF7A00]"><LockKeyhole className="size-5" aria-hidden="true" /><span className="text-sm font-medium">Segurança</span></div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{hasPassword ? "Trocar senha" : "Definir senha"}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {hasPassword
              ? "Informe a senha atual e escolha uma nova."
              : "Você entrou com o Google. Defina uma senha para também entrar com e-mail e senha."}
          </p>
        </header>

        <PasswordForm hasPassword={hasPassword} />

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-[#111113] p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-200">Formas de entrar</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {providers.map((provider) => (
              <li key={provider} className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                {provider === "email" ? "E-mail e senha" : provider === "google" ? "Google" : provider}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
