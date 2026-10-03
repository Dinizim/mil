import { z } from "zod";

import { isValidDate } from "./dates";
import { appError } from "./errors";
import { parseMoney } from "./money";

/** Valor positivo com até 2 casas. Aceita string digitada ("19,99") ou número. */
export const moneySchema = (message = "Informe um valor maior que zero.") =>
  z.union([z.string(), z.number()]).transform((value, context) => {
    const parsed = parseMoney(value);
    if (parsed === null) {
      context.addIssue({ code: "custom", message: "Informe um valor válido com no máximo 2 casas decimais." });
      return z.NEVER;
    }
    if (parsed <= 0) {
      context.addIssue({ code: "custom", message });
      return z.NEVER;
    }
    return parsed;
  });

export const dateSchema = (message = "Informe uma data válida.") =>
  z.string({ error: message }).refine(isValidDate, message);

export const transactionTypeSchema = z.enum(["income", "expense"], { error: "Tipo de transação inválido." });

export const idSchema = (message: string) => z.string({ error: message }).min(1, message);

const descriptionSchema = z
  .string({ error: "Descrição inválida." })
  .trim()
  .max(200, "A descrição deve ter no máximo 200 caracteres.")
  .default("");

export const transactionInputSchema = z.object({
  type: transactionTypeSchema,
  amount: moneySchema(),
  description: descriptionSchema,
  categoryId: idSchema("Selecione uma categoria."),
  transactionDate: dateSchema(),
});
export type TransactionInput = z.input<typeof transactionInputSchema>;

export const categoryInputSchema = z.object({
  name: z
    .string({ error: "Informe o nome da categoria." })
    .trim()
    .min(1, "Informe o nome da categoria.")
    .max(60, "O nome da categoria deve ter no máximo 60 caracteres."),
  type: z.enum(["income", "expense"], { error: "Tipo de categoria inválido." }),
});

export const goalInputSchema = z
  .object({
    name: z
      .string({ error: "Informe o nome da meta." })
      .trim()
      .min(1, "Informe o nome da meta.")
      .max(100, "O nome da meta deve ter no máximo 100 caracteres."),
    targetAmount: moneySchema("Informe um valor válido para a meta."),
    startDate: dateSchema("Informe uma data de início válida."),
    endDate: z
      .union([z.string(), z.null()])
      .optional()
      .transform((value) => value || null)
      .refine((value) => value === null || isValidDate(value), "Informe uma data final válida."),
  })
  .refine((goal) => !goal.endDate || goal.endDate >= goal.startDate, {
    message: "A data final não pode ser anterior à data de início.",
  });
export type GoalInput = z.input<typeof goalInputSchema>;

export const contributionInputSchema = z.object({
  goalId: idSchema("Meta inválida."),
  amount: moneySchema("O valor deve ser maior que zero."),
  description: descriptionSchema,
});

export const passwordSchema = z
  .string({ error: "Informe a senha." })
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72, "A senha deve ter no máximo 72 caracteres.");

/** Valida com Zod e lança AppError com a primeira mensagem amigável. */
export function parseInput<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) throw appError(result.error.issues[0]?.message ?? "Dados inválidos.");
  return result.data;
}
