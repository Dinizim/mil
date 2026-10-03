"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import AuthShell, { authButtonClass, authInputClass } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    // Mesma resposta exista ou não a conta, para não revelar quem é cliente.
    setSent(true);
    setLoading(false);
  }

  return (
    <AuthShell title="Esqueceu a senha?" subtitle="Enviaremos um link para você criar uma nova senha.">
      {sent ? (
        <Alert tone="success">
          Se existir uma conta com o e-mail <strong>{email}</strong>, você receberá um link em instantes. Confira também a caixa de spam.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">E-mail</label>
            <input id="email" type="email" placeholder="voce@email.com" value={email} onChange={(event) => setEmail(event.target.value)} className={authInputClass} autoComplete="email" required />
          </div>
          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? "Enviando..." : "Enviar link"}
          </button>
        </form>
      )}

      <div className="mt-6 border-t border-zinc-800 pt-5 text-center text-sm text-zinc-500">
        Lembrou?{" "}
        <Link href="/login" className="font-semibold text-[#FF7A00] transition hover:text-[#FF8A1A]">Voltar para o login</Link>
      </div>
    </AuthShell>
  );
}
