/**
 * Utilitários de dinheiro. Toda conta interna é feita em centavos (inteiros)
 * para evitar erros de ponto flutuante como 19.99 * 100 = 1998.9999999999998.
 */

export function toCents(value: number | string): number {
  return Math.round(Number(value) * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

/** Soma valores monetários sem acumular erro de ponto flutuante. */
export function sumMoney(values: Array<number | string>): number {
  return fromCents(values.reduce<number>((total, value) => total + toCents(value), 0));
}

/** Verifica se um número tem no máximo 2 casas decimais, com tolerância. */
export function hasAtMostTwoDecimals(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
}

/**
 * Converte o que o usuário digitou em número. Aceita "19,99", "19.99",
 * "1.234,56", "1,234.56", "R$ 19,99" e números. Retorna null se inválido
 * ou com mais de 2 casas decimais.
 */
export function parseMoney(input: string | number): number | null {
  if (typeof input === "number") {
    return Number.isFinite(input) && hasAtMostTwoDecimals(input) ? fromCents(toCents(input)) : null;
  }

  let value = input.replace(/\s|R\$/gi, "").trim();
  if (!value) return null;

  const negative = value.startsWith("-");
  value = value.replace(/^[-+]/, "");

  const lastComma = value.lastIndexOf(",");
  const lastDot = value.lastIndexOf(".");

  if (lastComma > -1 && lastDot > -1) {
    // O separador que aparece por último é o decimal.
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    value = value.split(thousandSeparator).join("").replace(decimalSeparator, ".");
  } else if (lastComma > -1) {
    if (value.split(",").length > 2) return null;
    value = value.replace(",", ".");
  } else if (lastDot > -1 && (value.split(".").length > 2 || /^\d{1,3}\.\d{3}$/.test(value))) {
    // "1.234.567" ou "1.500" → separador de milhar, como se escreve no Brasil.
    value = value.split(".").join("");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;

  const [integerPart, decimalPart = ""] = value.split(".");
  const cents = Number(integerPart) * 100 + Number(decimalPart.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) return null;

  return fromCents(negative ? -cents : cents);
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCurrency(value: number | string): string {
  return currencyFormatter.format(Number(value));
}
