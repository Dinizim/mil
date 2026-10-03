import { describe, expect, it } from "vitest";

import { compareWithAverage, computeFinancialSummary, computeGoalPlan, groupByCategory, groupByMonth } from "./finance";

describe("computeFinancialSummary", () => {
  it("separa saldo total, reservado e disponível", () => {
    const summary = computeFinancialSummary(
      [
        { type: "income", amount: "3000.00" },
        { type: "expense", amount: 19.99 },
        { type: "expense", amount: "0.29" },
      ],
      [{ amount: 500 }, { amount: "100.10" }]
    );

    expect(summary).toEqual({
      totalIncome: 3000,
      totalExpense: 20.28,
      balance: 2979.72,
      totalReserved: 600.1,
      availableBalance: 2379.62,
    });
  });

  it("funciona sem dados", () => {
    expect(computeFinancialSummary([], []).availableBalance).toBe(0);
  });
});

describe("agrupamentos", () => {
  it("groupByMonth ordena e soma por mês", () => {
    expect(
      groupByMonth([
        { type: "expense", amount: 10.1, transaction_date: "2026-09-02" },
        { type: "income", amount: 100, transaction_date: "2026-08-15" },
        { type: "expense", amount: 0.2, transaction_date: "2026-09-20" },
      ])
    ).toEqual([
      { month: "2026-08", income: 100, expense: 0 },
      { month: "2026-09", income: 0, expense: 10.3 },
    ]);
  });

  it("groupByCategory ordena do maior para o menor", () => {
    expect(
      groupByCategory([
        { category: "Mercado", amount: 50 },
        { category: "Uber", amount: 80 },
        { category: "Mercado", amount: 40 },
      ])
    ).toEqual([
      { category: "Mercado", amount: 90 },
      { category: "Uber", amount: 80 },
    ]);
  });

  it("compareWithAverage calcula variação contra a média", () => {
    const [mercado, novo] = compareWithAverage(
      [{ category: "Mercado", amount: 600 }, { category: "Pet", amount: 100 }],
      [[{ category: "Mercado", amount: 500 }], [{ category: "Mercado", amount: 400 }], []]
    );
    expect(mercado).toEqual({ category: "Mercado", current: 600, average: 300, variation: 1 });
    expect(novo).toEqual({ category: "Pet", current: 100, average: 0, variation: null });
  });
});

describe("computeGoalPlan", () => {
  const goal = { target_amount: 1200, start_date: "2026-01-01", end_date: "2026-12-31" };

  it("sugere valor mensal pelos meses restantes", () => {
    const plan = computeGoalPlan(goal, 600, "2026-07-01");
    expect(plan.monthsLeft).toBe(6);
    expect(plan.suggestedMonthly).toBe(100);
  });

  it("classifica o ritmo", () => {
    expect(computeGoalPlan(goal, 600, "2026-07-02").pace).toBe("on_track");
    expect(computeGoalPlan(goal, 100, "2026-07-02").pace).toBe("behind");
    expect(computeGoalPlan(goal, 1000, "2026-07-02").pace).toBe("ahead");
  });

  it("trata meta concluída, sem prazo e vencida", () => {
    expect(computeGoalPlan(goal, 1200, "2026-07-01").pace).toBe("completed");
    expect(computeGoalPlan({ ...goal, end_date: null }, 0, "2026-07-01")).toMatchObject({ pace: "no_deadline", suggestedMonthly: null });
    expect(computeGoalPlan(goal, 1000, "2027-01-05")).toMatchObject({ pace: "overdue", suggestedMonthly: 200 });
  });

  it("arredonda o valor sugerido para cima no centavo", () => {
    const plan = computeGoalPlan({ target_amount: 100, start_date: "2026-09-01", end_date: "2026-11-30" }, 0, "2026-09-15");
    expect(plan.monthsLeft).toBe(3);
    expect(plan.suggestedMonthly).toBe(33.34);
  });
});
