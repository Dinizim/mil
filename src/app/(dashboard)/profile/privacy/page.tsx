import { ArrowLeft, Download, FileJson, Mail, Shield } from "lucide-react";
import Link from "next/link";

import { getAuthenticatedUser } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { PRIVACY_EMAIL } from "@/lib/site";

import DeleteAccount from "./DeleteAccount";

const STORED_DATA = [
  { title: "Conta", detail: "Nome, e-mail, data de cadastro, forma de login e o aceite dos termos." },
  { title: "Transações", detail: "Valor, tipo, categoria, descrição e data. Lançamentos cancelados ficam guardados para o seu histórico." },
  { title: "Categorias", detail: "Nome e tipo das categorias que você criou, incluindo as arquivadas." },
  { title: "Metas e aportes", detail: "Nome, valor, prazo e cada aporte com data e descrição." },
];

const CSV_TABLES = [
  { table: "transactions", label: "Transações" },
  { table: "categories", label: "Categorias" },
  { table: "goals", label: "Metas" },
  { table: "goal_contributions", label: "Aportes" },
];

const exportLinkClass =
  "inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-700 px-3.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800";

export default async function PrivacySettingsPage() {
  const { user } = await getAuthenticatedUser();
  const hasPassword = Boolean(user.identities?.some((identity) => identity.provider === "email"));
  const termsAcceptedAt = user.user_metadata?.terms_accepted_at as string | undefined;

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Meu Perfil
        </Link>
        <header className="mt-4 mb-8">
          <div className="flex items-center gap-2 text-[#FF7A00]"><Shield className="size-5" aria-hidden="true" /><span className="text-sm font-medium">LGPD</span></div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Privacidade e dados</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Seus dados são usados só para o Mil funcionar para você. Veja a{" "}
            <Link href="/privacy" className="font-medium text-[#FF7A00] hover:text-[#FF8A1A]">Política de privacidade</Link>.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-[#111113] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">O que guardamos</h2>
          <dl className="mt-4 space-y-4">
            {STORED_DATA.map((item) => (
              <div key={item.title}>
                <dt className="text-sm font-medium text-zinc-200">{item.title}</dt>
                <dd className="mt-1 text-sm leading-6 text-zinc-500">{item.detail}</dd>
              </div>
            ))}
          </dl>
          {termsAcceptedAt && (
            <p className="mt-5 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
              Termos aceitos em {formatDate(termsAcceptedAt.slice(0, 10))} (versão {String(user.user_metadata?.terms_version)}).
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-[#111113] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">Exportar meus dados</h2>
          <p className="mt-1 text-sm text-zinc-500">Baixe uma cópia completa para guardar ou levar para outro serviço.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/api/account/export?format=json" download className={exportLinkClass}>
              <FileJson className="size-4 text-[#FF7A00]" aria-hidden="true" />
              Tudo (JSON)
            </a>
            {CSV_TABLES.map((item) => (
              <a key={item.table} href={`/api/account/export?format=csv&table=${item.table}`} download className={exportLinkClass}>
                <Download className="size-4" aria-hidden="true" />
                {item.label} (CSV)
              </a>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-[#111113] p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><Mail className="size-4 text-[#FF7A00]" aria-hidden="true" />Contato de privacidade</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {PRIVACY_EMAIL ? (
              <>Dúvidas ou pedidos sobre seus dados: <a href={`mailto:${PRIVACY_EMAIL}`} className="font-medium text-zinc-200 underline-offset-4 hover:underline">{PRIVACY_EMAIL}</a>.</>
            ) : (
              "O canal de contato de privacidade ainda não foi configurado."
            )}
          </p>
        </section>

        <DeleteAccount hasPassword={hasPassword} />
      </div>
    </main>
  );
}
