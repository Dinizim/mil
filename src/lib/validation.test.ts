import { describe, expect, it } from "vitest";

import { AppError } from "./errors";
import { goalInputSchema, parseInput, transactionInputSchema } from "./validation";

const validTransaction = {
  type: "expense",
  amount: "19,99",
  description: "  Padaria ",
  categoryId: "abc",
  transactionDate: "2026-09-30",
};

describe("transactionInputSchema", () => {
  it("aceita R$ 19,99 e normaliza a descrição", () => {
    expect(parseInput(transactionInputSchema, validTransaction)).toEqual({
      type: "expense",
      amount: 19.99,
      description: "Padaria",
      categoryId: "abc",
      transactionDate: "2026-09-30",
    });
  });

  it("lança AppError com mensagem amigável", () => {
    expect(() => parseInput(transactionInputSchema, { ...validTransaction, amount: "0" })).toThrow(AppError);
    expect(() => parseInput(transactionInputSchema, { ...validTransaction, amount: "1,999" })).toThrow(/2 casas/);
    expect(() => parseInput(transactionInputSchema, { ...validTransaction, transactionDate: "2026-02-30" })).toThrow(/data válida/);
    expect(() => parseInput(transactionInputSchema, { ...validTransaction, categoryId: "" })).toThrow(/categoria/);
  });
});

describe("goalInputSchema", () => {
  it("transforma data final vazia em null", () => {
    expect(
      parseInput(goalInputSchema, { name: "Viagem", targetAmount: "5.000,00", startDate: "2026-09-01", endDate: "" })
    ).toMatchObject({ targetAmount: 5000, endDate: null });
  });

  it("rejeita data final antes do início", () => {
    expect(() =>
      parseInput(goalInputSchema, { name: "Viagem", targetAmount: 10, startDate: "2026-09-01", endDate: "2026-08-01" })
    ).toThrow(/anterior/);
  });
});
