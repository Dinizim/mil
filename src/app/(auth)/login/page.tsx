"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { getClientErrorMessage } from "@/lib/errors";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
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
    <main className="min-h-screen bg-[#09090B] px-4 py-8 text-zinc-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#FF7A00]/15 text-[#FF7A00]">
              <Wallet className="size-6" aria-hidden="true" />
            </div>

            <p className="mt-5 text-sm font-medium text-[#FF7A00]">Mil</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Entre na sua conta para acompanhar sua vida financeira.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-2xl border border-zinc-800 bg-[#111113] p-5 shadow-2xl shadow-black/20 sm:p-6"
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-[#18181B] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Senha
                </label>
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
                    className="h-12 w-full rounded-xl border border-zinc-800 bg-[#18181B] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {message && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm leading-5 text-rose-300"
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 text-sm font-semibold text-[#17110A] transition hover:bg-[#FF8A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar"}
                {!loading && <ArrowRight className="size-4" aria-hidden="true" />}
              </button>
            </div>

            <div className="mt-6 border-t border-zinc-800 pt-5 text-center text-sm text-zinc-500">
              Não possui uma conta?{" "}
              <Link
                href="/register"
                className="font-semibold text-[#FF7A00] transition hover:text-[#FF8A1A]"
              >
                Criar conta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
