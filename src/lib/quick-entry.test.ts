import { describe, expect, it } from "vitest";

import { parseQuickEntry } from "./quick-entry";

const categories = [
  { id: "c1", name: "Mercado", type: "expense" as const },
  { id: "c2", name: "Transporte", type: "expense" as const },
  { id: "c3", name: "Salário", type: "income" as const },
];

describe("parseQuickEntry", () => {
  it("entende gasto simples e acha a categoria", () => {
    expect(parseQuickEntry("mercado 85", categories)).toEqual({
      type: "expense",
      amount: 85,
      description: "Mercado",
      categoryId: "c1",
    });
  });

  it("aceita centavos com vírgula e valor no começo", () => {
    expect(parseQuickEntry("23,50 uber", categories)).toMatchObject({ amount: 23.5, description: "Uber", categoryId: null });
    expect(parseQuickEntry("R$ 1.200,00 aluguel", categories)).toMatchObject({ amount: 1200, description: "Aluguel" });
  });

  it("reconhece entrada por + ou palavra-chave", () => {
    expect(parseQuickEntry("+freela 500", categories)).toMatchObject({ type: "income", amount: 500 });
    expect(parseQuickEntry("salário 3000", categories)).toMatchObject({ type: "income", categoryId: "c3" });
  });

  it("casa categoria por parte da palavra", () => {
    expect(parseQuickEntry("transp 12", categories)?.categoryId).toBe("c2");
  });

  it("retorna null sem valor válido", () => {
    expect(parseQuickEntry("mercado", categories)).toBeNull();
    expect(parseQuickEntry("", categories)).toBeNull();
    expect(parseQuickEntry("mercado 0", categories)).toBeNull();
  });
});
