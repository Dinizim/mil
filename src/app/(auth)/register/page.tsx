"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AuthShell, { authButtonClass, authInputClass } from "@/components/auth/AuthShell";
import GoogleButton from "@/components/auth/GoogleButton";
import { Alert } from "@/components/ui/form";
import { getClientErrorMessage } from "@/lib/errors";
import { TERMS_VERSION } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (!acceptedTerms) {
      setMessage("Para criar a conta, aceite os Termos de uso e a Política de privacidade.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name,
          // Registro do aceite (LGPD): data e versão dos termos aceitos.
          terms_version: TERMS_VERSION,
          terms_accepted_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      setMessage(getClientErrorMessage(error, "Não foi possível criar a conta."));
      setLoading(false);
      return;
    }

    if (!data.session) {
      setSuccess("Conta criada. Verifique seu e-mail para confirmar o cadastro antes de entrar.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell title="Crie sua conta" subtitle="Comece a organizar sua vida financeira em um só lugar.">
      {success ? (
        <Alert tone="success">{success}</Alert>
      ) : (
        <>
          <GoogleButton onError={setMessage} />
          <p className="mt-3 text-center text-xs leading-5 text-zinc-600">
            Ao continuar com o Google, você concorda com os{" "}
            <Link href="/terms" className="text-zinc-400 underline-offset-2 hover:underline">Termos de uso</Link> e a{" "}
            <Link href="/privacy" className="text-zinc-400 underline-offset-2 hover:underline">Política de privacidade</Link>.
          </p>

          <div className="my-5 flex items-center gap-3 text-xs text-zinc-600">
            <span className="h-px flex-1 bg-zinc-800" />
            ou com e-mail
            <span className="h-px flex-1 bg-zinc-800" />
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-300">Nome</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-600" aria-hidden="true" />
                <input id="name" type="text" placeholder="Seu nome" value={name} onChange={(event) => setName(event.target.value)} className={authInputClass + " pl-11"} autoComplete="name" maxLength={100} required />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">E-mail</label>
              <input id="email" type="email" placeholder="voce@email.com" value={email} onChange={(event) => setEmail(event.target.value)} className={authInputClass} autoComplete="email" required />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-300">Senha</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-600" aria-hidden="true" />
                <input id="password" type="password" placeholder="Mínimo de 8 caracteres" value={password} onChange={(event) => setPassword(event.target.value)} className={authInputClass + " pl-11"} autoComplete="new-password" minLength={8} required />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm leading-5 text-zinc-400">
              <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#FF7A00]" required />
              <span>
                Li e aceito os <Link href="/terms" target="_blank" className="font-medium text-[#FF7A00] hover:text-[#FF8A1A]">Termos de uso</Link> e a{" "}
                <Link href="/privacy" target="_blank" className="font-medium text-[#FF7A00] hover:text-[#FF8A1A]">Política de privacidade</Link>.
              </span>
            </label>

            <Alert>{message}</Alert>

            <button type="submit" disabled={loading} className={authButtonClass}>
              {loading ? "Criando..." : "Criar conta"}
              {!loading && <ArrowRight className="size-4" aria-hidden="true" />}
            </button>
          </form>
        </>
      )}

      <div className="mt-6 border-t border-zinc-800 pt-5 text-center text-sm text-zinc-500">
        Já possui uma conta?{" "}
        <Link href="/login" className="font-semibold text-[#FF7A00] transition hover:text-[#FF8A1A]">Entrar</Link>
      </div>
    </AuthShell>
  );
}
