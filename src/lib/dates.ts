export const APP_TIME_ZONE = "America/Sao_Paulo";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Data de hoje (YYYY-MM-DD) no fuso de São Paulo, e não em UTC. */
export function todayISO(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function currentMonth(now: Date = new Date()): string {
  return todayISO(now).slice(0, 7);
}

export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function isValidMonth(value: unknown): value is string {
  return typeof value === "string" && MONTH_PATTERN.test(value);
}

/** Soma (ou subtrai) meses de um "YYYY-MM". */
export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Intervalo [start, end) de datas de um mês, para filtros gte/lt. */
export function monthRange(month: string): { start: string; end: string } {
  return { start: `${month}-01`, end: `${shiftMonth(month, 1)}-01` };
}

/** Lê o parâmetro ?month= e cai no mês atual quando inválido. */
export function resolveMonth(value: string | string[] | undefined): string {
  const month = Array.isArray(value) ? value[0] : value;
  return isValidMonth(month) ? month : currentMonth();
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date + "T00:00:00"));
}

export function formatMonthLabel(month: string, style: "long" | "short" = "long"): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", { month: style, year: "numeric" }).format(
    new Date(year, monthNumber - 1, 1)
  );
  return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1);
}

/** Diferença em dias entre duas datas YYYY-MM-DD (b - a). */
export function daysBetween(a: string, b: string): number {
  const toUTC = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUTC(b) - toUTC(a)) / 86_400_000);
}
