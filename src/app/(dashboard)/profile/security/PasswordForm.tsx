"use client";

import { useId, useState } from "react";

import { Alert, Field, SubmitLabel, inputClass, primaryButtonClass } from "@/components/ui/form";
import { getClientErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";

export default function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const ids = { current: useId(), next: useId(), confirm: useId() };
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (hasPassword && !current) return setStatus({ tone: "error", text: "Informe a senha atual." });
    if (next.length < 8) return setStatus({ tone: "error", text: "A nova senha precisa ter pelo menos 8 caracteres." });
    if (next !== confirm) return setStatus({ tone: "error", text: "As senhas não conferem." });

    setLoading(true);
    const supabase = createClient();
    // Desde o supabase-js 2.102 a troca pode exigir a senha atual (current_password).
    const { error } = await supabase.auth.updateUser(hasPassword ? { password: next, current_password: current } : { password: next });
    setLoading(false);

    if (error) {
      setStatus({ tone: "error", text: getClientErrorMessage(error, "Não foi possível salvar a senha.") });
      return;
    }

    setCurrent("");
    setNext("");
    setConfirm("");
    setStatus({ tone: "success", text: hasPassword ? "Senha alterada." : "Senha definida. Agora você também pode entrar com e-mail e senha." });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-[#111113] p-5 sm:p-6">
      {hasPassword && (
        <Field label="Senha atual" htmlFor={ids.current}>
          <input id={ids.current} type="password" value={current} onChange={(event) => setCurrent(event.target.value)} autoComplete="current-password" className={inputClass} />
        </Field>
      )}
      <Field label="Nova senha" hint="(mínimo de 8 caracteres)" htmlFor={ids.next}>
        <input id={ids.next} type="password" value={next} onChange={(event) => setNext(event.target.value)} autoComplete="new-password" minLength={8} className={inputClass} />
      </Field>
      <Field label="Confirmar nova senha" htmlFor={ids.confirm}>
        <input id={ids.confirm} type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" minLength={8} className={inputClass} />
      </Field>
      {status && <Alert tone={status.tone}>{status.text}</Alert>}
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className={primaryButtonClass}>
          <SubmitLabel loading={loading} idle={hasPassword ? "Trocar senha" : "Definir senha"} busy="Salvando..." />
        </button>
      </div>
    </form>
  );
}
