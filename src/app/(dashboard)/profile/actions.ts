"use server";

import { z } from "zod";

import { runAction } from "@/lib/action-result";
import { getAuthenticatedUser } from "@/lib/auth";
import { appError, databaseErrorMessage } from "@/lib/errors";
import { revalidateApp } from "@/lib/revalidate";
import { parseInput } from "@/lib/validation";
import { deleteAccount } from "@/services/account.service";

const nameSchema = z
  .string({ error: "Informe seu nome." })
  .trim()
  .min(1, "Informe seu nome.")
  .max(100, "O nome deve ter no máximo 100 caracteres.");

export async function updateNameAction(name: string) {
  return runAction("Não foi possível atualizar o nome.", async () => {
    const value = parseInput(nameSchema, name);
    const { supabase, user } = await getAuthenticatedUser();

    const { error } = await supabase.from("profiles").upsert({ id: user.id, name: value });
    if (error) throw appError(databaseErrorMessage(error, "Não foi possível atualizar o nome."));

    revalidateApp();
  });
}

export async function deleteAccountAction(confirmation: { password?: string; phrase?: string }) {
  return runAction("Não foi possível excluir a conta.", async () => {
    await deleteAccount({
      password: typeof confirmation?.password === "string" ? confirmation.password : undefined,
      phrase: typeof confirmation?.phrase === "string" ? confirmation.phrase : undefined,
    });
    // A sessão local é encerrada pelo navegador logo em seguida (signOut com scope "local").
  });
}
