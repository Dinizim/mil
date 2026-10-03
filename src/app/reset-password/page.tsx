"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import AuthShell, { authButtonClass, authInputClass } from "@/components/auth/AuthShell";
import { Alert } from "@/components/ui/form";
import { getClientErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";

/** Chega aqui pelo link de recuperação (o callback já criou a sessão). */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    if (password !== confirmation) return setError("As senhas não conferem.");

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(getClientErrorMessage(updateError, "Não foi possível alterar a senha. Peça um novo link."));
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell title="Nova senha" subtitle="Escolha uma senha com pelo menos 8 caracteres.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-300">Nova senha</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={authInputClass} autoComplete="new-password" minLength={8} required />
        </div>
        <div>
          <label htmlFor="confirmation" className="mb-2 block text-sm font-medium text-zinc-300">Confirmar nova senha</label>
          <input id="confirmation" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={authInputClass} autoComplete="new-password" minLength={8} required />
        </div>
        <Alert>{error}</Alert>
        <button type="submit" disabled={loading} className={authButtonClass}>
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </AuthShell>
  );
}
