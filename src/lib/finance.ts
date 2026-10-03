import { daysBetween } from "./dates";
import { fromCents, toCents } from "./money";

export type TransactionType = "income" | "expense";

type AmountRow = { type: TransactionType; amount: number | string };

export type FinancialSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalReserved: number;
  availableBalance: number;
};

/**
 * Regra central do Mil:
 * saldo total = entradas - despesas
 * saldo disponível = saldo total - dinheiro reservado em metas ativas
 */
export function computeFinancialSummary(
  transactions: AmountRow[],
  activeContributions: Array<{ amount: number | string }>
): FinancialSummary {
  let income = 0;
  let expense = 0;

  for (const transaction of transactions) {
    if (transaction.type === "income") income += toCents(transaction.amount);
    else expense += toCents(transaction.amount);
  }

  const reserved = activeContributions.reduce((total, item) => total + toCents(item.amount), 0);
  const balance = income - expense;

  return {
    totalIncome: fromCents(income),
    totalExpense: fromCents(expense),
    balance: fromCents(balance),
    totalReserved: fromCents(reserved),
    availableBalance: fromCents(balance - reserved),
  };
}

export function sumByType(transactions: AmountRow[]) {
  const { totalIncome, totalExpense, balance } = computeFinancialSummary(transactions, []);
  return { totalIncome, totalExpense, balance };
}

export function groupByMonth(rows: Array<AmountRow & { transaction_date: string }>) {
  const grouped = new Map<string, { month: string; income: number; expense: number }>();

  for (const row of rows) {
    const month = row.transaction_date.slice(0, 7);
    const entry = grouped.get(month) ?? { month, income: 0, expense: 0 };
    if (row.type === "income") entry.income += toCents(row.amount);
    else entry.expense += toCents(row.amount);
    grouped.set(month, entry);
  }

  return [...grouped.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((entry) => ({ ...entry, income: fromCents(entry.income), expense: fromCents(entry.expense) }));
}

export function groupByCategory(rows: Array<{ amount: number | string; category: string }>) {
  const grouped = new Map<string, number>();
  for (const row of rows) grouped.set(row.category, (grouped.get(row.category) ?? 0) + toCents(row.amount));

  return [...grouped.entries()]
    .map(([category, cents]) => ({ category, amount: fromCents(cents) }))
    .sort((a, b) => b.amount - a.amount);
}

export type GoalPace = "completed" | "ahead" | "on_track" | "behind" | "overdue" | "no_deadline";

export type GoalPlan = {
  pace: GoalPace;
  /** Valor sugerido por mês até a data final; null quando não há prazo. */
  suggestedMonthly: number | null;
  /** Quanto deveria estar guardado hoje, pelo ritmo linear. */
  expectedToday: number | null;
  monthsLeft: number | null;
};

/** Margem (em % da meta) para considerar a meta "no ritmo". */
const PACE_TOLERANCE = 0.05;

export function computeGoalPlan(
  goal: { target_amount: number | string; start_date: string; end_date: string | null },
  currentAmount: number,
  today: string
): GoalPlan {
  const target = toCents(goal.target_amount);
  const current = toCents(currentAmount);
  const remaining = Math.max(target - current, 0);

  if (remaining === 0) return { pace: "completed", suggestedMonthly: 0, expectedToday: fromCents(target), monthsLeft: 0 };
  if (!goal.end_date) return { pace: "no_deadline", suggestedMonthly: null, expectedToday: null, monthsLeft: null };

  const daysLeft = daysBetween(today, goal.end_date);
  if (daysLeft < 0) return { pace: "overdue", suggestedMonthly: fromCents(remaining), expectedToday: fromCents(target), monthsLeft: 0 };

  // Conta meses de calendário restantes, incluindo o atual (mínimo 1).
  const [todayYear, todayMonth] = today.split("-").map(Number);
  const [endYear, endMonth] = goal.end_date.split("-").map(Number);
  const monthsLeft = Math.max((endYear - todayYear) * 12 + (endMonth - todayMonth) + 1, 1);

  const totalDays = Math.max(daysBetween(goal.start_date, goal.end_date), 1);
  const elapsedDays = Math.min(Math.max(daysBetween(goal.start_date, today), 0), totalDays);
  const expected = Math.round((target * elapsedDays) / totalDays);
  const diff = current - expected;
  const tolerance = target * PACE_TOLERANCE;

  const pace: GoalPace = diff > tolerance ? "ahead" : diff < -tolerance ? "behind" : "on_track";

  return {
    pace,
    suggestedMonthly: fromCents(Math.ceil(remaining / monthsLeft)),
    expectedToday: fromCents(expected),
    monthsLeft,
  };
}

/** Compara o gasto de cada categoria no mês com a média dos meses anteriores. */
export function compareWithAverage(
  current: Array<{ category: string; amount: number }>,
  previousMonths: Array<Array<{ category: string; amount: number }>>
) {
  const categories = new Set([...current.map((item) => item.category), ...previousMonths.flat().map((item) => item.category)]);
  const monthsCount = Math.max(previousMonths.length, 1);

  return [...categories]
    .map((category) => {
      const currentCents = toCents(current.find((item) => item.category === category)?.amount ?? 0);
      const previousTotal = previousMonths
        .flat()
        .filter((item) => item.category === category)
        .reduce((total, item) => total + toCents(item.amount), 0);
      const averageCents = Math.round(previousTotal / monthsCount);
      const variation = averageCents > 0 ? (currentCents - averageCents) / averageCents : null;

      return { category, current: fromCents(currentCents), average: fromCents(averageCents), variation };
    })
    .sort((a, b) => b.current - a.current || b.average - a.average);
}
