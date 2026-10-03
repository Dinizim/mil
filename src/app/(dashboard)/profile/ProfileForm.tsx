"use client";

import { useId, useState } from "react";

import { Alert, Field, SubmitLabel, inputClass, primaryButtonClass } from "@/components/ui/form";
import { getClientErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";

import { updateNameAction } from "./actions";

/** Correção de dados (LGPD, art. 18, III): nome e e-mail. */
export default function ProfileForm({ name, email, pendingEmail }: { name: string; email: string; pendingEmail: string | null }) {
  const ids = { name: useId(), email: useId() };
  const [nameValue, setNameValue] = useState(name);
  const [emailValue, setEmailValue] = useState(email);
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [nameStatus, setNameStatus] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [emailStatus, setEmailStatus] = useState<{ tone: "error" | "success" | "info"; text: string } | null>(
    pendingEmail ? { tone: "info", text: `Confirmação pendente para ${pendingEmail}. Verifique sua caixa de entrada.` } : null
  );

  async function saveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingName(true);
    const result = await updateNameAction(nameValue);
    setSavingName(false);
    setNameStatus(result.ok ? { tone: "success", text: "Nome atualizado." } : { tone: "error", text: result.error });
  }

  async function saveEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = emailValue.trim();
    if (!nextEmail || nextEmail === email) return;

    setSavingEmail(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser(
      { email: nextEmail },
      { emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile` }
    );
    setSavingEmail(false);

    setEmailStatus(
      error
        ? { tone: "error", text: getClientErrorMessage(error, "Não foi possível alterar o e-mail.") }
        : { tone: "success", text: `Enviamos um link de confirmação para ${nextEmail}. O e-mail só muda depois da confirmação.` }
    );
  }

  return (
    <section className="mt-6 space-y-6 rounded-2xl border border-zinc-800 bg-[#111113] p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-white">Dados da conta</h2>

      <form onSubmit={saveName} className="space-y-3">
        <Field label="Nome" htmlFor={ids.name}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input id={ids.name} type="text" value={nameValue} maxLength={100} onChange={(event) => { setNameValue(event.target.value); setNameStatus(null); }} className={inputClass} autoComplete="name" />
            <button type="submit" disabled={savingName || !nameValue.trim() || nameValue.trim() === name} className={primaryButtonClass + " shrink-0"}>
              <SubmitLabel loading={savingName} idle="Salvar" busy="Salvando..." />
            </button>
          </div>
        </Field>
        {nameStatus && <Alert tone={nameStatus.tone}>{nameStatus.text}</Alert>}
      </form>

      <form onSubmit={saveEmail} className="space-y-3 border-t border-zinc-800 pt-6">
        <Field label="E-mail" htmlFor={ids.email}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input id={ids.email} type="email" value={emailValue} onChange={(event) => { setEmailValue(event.target.value); setEmailStatus(null); }} className={inputClass} autoComplete="email" />
            <button type="submit" disabled={savingEmail || !emailValue.trim() || emailValue.trim() === email} className={primaryButtonClass + " shrink-0"}>
              <SubmitLabel loading={savingEmail} idle="Alterar" busy="Enviando..." />
            </button>
          </div>
        </Field>
        {emailStatus && <Alert tone={emailStatus.tone}>{emailStatus.text}</Alert>}
      </form>
    </section>
  );
}
