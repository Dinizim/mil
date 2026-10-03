"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authButtonClass, authInputClass } from "@/components/auth/AuthShell";
import GoogleButton from "@/components/auth/GoogleButton";
import { Alert } from "@/components/ui/form";
import { getClientErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ initialError, notice }: { initialError: string; notice: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(getClientErrorMessage(error, "Não foi possível entrar na conta."));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      {notice && <div className="mb-5"><Alert tone="success">{notice}</Alert></div>}

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

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="voce@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={authInputClass}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
              Senha
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-[#FF7A00] hover:text-[#FF8A1A]">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-600"
              aria-hidden="true"
            />
            <input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={authInputClass + " pl-11"}
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <Alert>{message}</Alert>

        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Entrando..." : "Entrar"}
          {!loading && <ArrowRight className="size-4" aria-hidden="true" />}
        </button>
      </form>

      <div className="mt-6 border-t border-zinc-800 pt-5 text-center text-sm text-zinc-500">
        Não possui uma conta?{" "}
        <Link href="/register" className="font-semibold text-[#FF7A00] transition hover:text-[#FF8A1A]">
          Criar conta
        </Link>
      </div>
    </>
  );
}
