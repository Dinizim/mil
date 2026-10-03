import { normalizeText } from "./import-statement";
import { parseMoney } from "./money";

export type QuickEntry = {
  type: "income" | "expense";
  amount: number;
  description: string;
  categoryId: string | null;
};

type Category = { id: string; name: string; type: "income" | "expense" };

const INCOME_WORDS = ["recebi", "salario", "entrada", "ganhei", "receita", "pix recebido"];
const AMOUNT_PATTERN = /(?:^|\s)(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)(?=\s|$)/i;

/**
 * Interpreta texto livre como "mercado 85", "uber 23,50" ou "+salário 3000".
 * Começar com "+" ou usar palavras como "recebi"/"salário" vira entrada.
 */
export function parseQuickEntry(text: string, categories: Category[]): QuickEntry | null {
  let input = text.trim();
  if (!input) return null;

  let forcedType: "income" | "expense" | null = null;
  if (input.startsWith("+")) {
    forcedType = "income";
    input = input.slice(1).trim();
  } else if (input.startsWith("-")) {
    forcedType = "expense";
    input = input.slice(1).trim();
  }

  const match = input.match(AMOUNT_PATTERN);
  if (!match) return null;

  const amount = parseMoney(match[1]);
  if (amount === null || amount <= 0) return null;

  const description = (input.slice(0, match.index) + " " + input.slice((match.index ?? 0) + match[0].length))
    .replace(/\s+/g, " ")
    .trim();
  const normalized = normalizeText(description);

  const type = forcedType ?? (INCOME_WORDS.some((word) => normalized.includes(word)) ? "income" : "expense");
  const candidates = categories.filter((category) => category.type === type);
  const words = normalized.split(" ").filter(Boolean);

  const category =
    candidates.find((item) => normalized.includes(normalizeText(item.name))) ??
    candidates.find((item) => words.some((word) => word.length >= 3 && normalizeText(item.name).includes(word))) ??
    null;

  return {
    type,
    amount,
    description: description.charAt(0).toLocaleUpperCase("pt-BR") + description.slice(1),
    categoryId: category?.id ?? null,
  };
}
