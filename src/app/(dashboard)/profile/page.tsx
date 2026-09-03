import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";

import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle()
    : { data: null };
  const name = profile?.name?.trim() || user?.user_metadata?.name?.trim() || "Usuário";
  const email = user?.email || "E-mail não disponível";
  const initial = name.charAt(0).toLocaleUpperCase("pt-BR");

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 sm:mb-10"><div className="flex items-center gap-2 text-[#FF7A00]"><UserRound className="size-5" aria-hidden="true" /><span className="text-sm font-medium">Sua conta</span></div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Meu Perfil</h1><p className="mt-2 text-sm text-zinc-400 sm:text-base">Gerencie as informações da sua conta.</p></header>

        <section className="rounded-2xl border border-zinc-800 bg-[#111113] p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#FF7A00]/10 text-2xl font-semibold text-[#FF7A00]">{initial}</div>
          <h2 className="mt-4 text-xl font-semibold text-white">{name}</h2><p className="mt-1 break-all text-sm text-zinc-400">{email}</p>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113] shadow-sm"><div className="border-b border-zinc-800 px-5 py-4 sm:px-6"><h2 className="text-lg font-semibold text-white">Conta</h2></div><dl className="divide-y divide-zinc-800"><ProfileDetail icon={UserRound} label="Nome" value={name} /><ProfileDetail icon={Mail} label="E-mail" value={email} /></dl></section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113] shadow-sm"><div className="border-b border-zinc-800 px-5 py-4 sm:px-6"><h2 className="text-lg font-semibold text-white">Segurança</h2></div><div className="flex items-center gap-3 px-5 py-4 sm:px-6"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400"><LockKeyhole className="size-4" aria-hidden="true" /></div><div className="min-w-0"><p className="text-sm font-medium text-zinc-200">Alterar senha</p><p className="mt-1 text-sm text-zinc-500">Disponível em uma próxima etapa.</p></div><ArrowRight className="ml-auto size-4 shrink-0 text-zinc-600" aria-hidden="true" /></div></section>

        <div className="mt-6"><LogoutButton /></div>
      </div>
    </main>
  );
}

function ProfileDetail({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return <div className="flex items-start gap-3 px-5 py-4 sm:px-6"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400"><Icon className="size-4" aria-hidden="true" /></div><div className="min-w-0"><dt className="text-sm text-zinc-500">{label}</dt><dd className="mt-1 break-all text-sm font-medium text-zinc-100">{value}</dd></div></div>;
}
