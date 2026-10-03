import { ChevronRight, LockKeyhole, Shield, UserRound } from "lucide-react";
import Link from "next/link";

import LogoutButton from "@/components/LogoutButton";
import { getAuthenticatedUser, getDisplayName } from "@/lib/auth";

import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const { supabase, user } = await getAuthenticatedUser();
  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();
  const name = getDisplayName(user, profile?.name);
  const email = user.email || "";
  const initial = name.charAt(0).toLocaleUpperCase("pt-BR");
  const pendingEmail = user.new_email ?? null;

  return (
    <main className="min-h-screen bg-[#09090B] px-4 py-6 text-zinc-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 text-[#FF7A00]"><UserRound className="size-5" aria-hidden="true" /><span className="text-sm font-medium">Sua conta</span></div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Meu Perfil</h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">Gerencie as informações da sua conta.</p>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-[#111113] p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#FF7A00]/10 text-2xl font-semibold text-[#FF7A00]">{initial}</div>
          <h2 className="mt-4 text-xl font-semibold text-white">{name}</h2>
          <p className="mt-1 break-all text-sm text-zinc-400">{email}</p>
        </section>

        <ProfileForm name={name === "Usuário" ? "" : name} email={email} pendingEmail={pendingEmail} />

        <nav aria-label="Configurações da conta" className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111113] shadow-sm">
          <SettingsLink href="/profile/security" icon={LockKeyhole} title="Segurança" description="Trocar ou definir sua senha." />
          <SettingsLink href="/profile/privacy" icon={Shield} title="Privacidade e dados" description="Exportar seus dados ou excluir sua conta." />
        </nav>

        <div className="mt-6"><LogoutButton showLabel /></div>
      </div>
    </main>
  );
}

function SettingsLink({ href, icon: Icon, title, description }: { href: string; icon: typeof UserRound; title: string; description: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 border-b border-zinc-800 px-5 py-4 transition last:border-b-0 hover:bg-[#18181B] sm:px-6">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400"><Icon className="size-4" aria-hidden="true" /></div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-200">{title}</p>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      <ChevronRight className="ml-auto size-4 shrink-0 text-zinc-600" aria-hidden="true" />
    </Link>
  );
}
