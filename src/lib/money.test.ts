import { describe, expect, it } from "vitest";

import { hasAtMostTwoDecimals, parseMoney, sumMoney, toCents } from "./money";

describe("hasAtMostTwoDecimals", () => {
  it.each([19.99, 0.29, 1.13, 4.35, 0.07, 1234.56, 10])("aceita %s (bug dos centavos)", (value) => {
    expect(hasAtMostTwoDecimals(value)).toBe(true);
  });

  it.each([1.234, 0.001, 19.999])("rejeita %s", (value) => {
    expect(hasAtMostTwoDecimals(value)).toBe(false);
  });
});

describe("parseMoney", () => {
  it.each([
    ["19,99", 19.99],
    ["19.99", 19.99],
    ["0,29", 0.29],
    ["R$ 1.234,56", 1234.56],
    ["1,234.56", 1234.56],
    ["1.500", 1500],
    ["1.234.567", 1234567],
    ["85", 85],
    ["-85,50", -85.5],
    ["5,5", 5.5],
    [4.35, 4.35],
  ])("converte %s em %s", (input, expected) => {
    expect(parseMoney(input)).toBe(expected);
  });

  it.each(["", "abc", "1,2,3", "19,999", "1.2.3,4.5", Number.NaN, 1.234])("rejeita %s", (input) => {
    expect(parseMoney(input as string | number)).toBeNull();
  });
});

describe("sumMoney", () => {
  it("soma sem erro de ponto flutuante", () => {
    expect(sumMoney([0.1, 0.2])).toBe(0.3);
    expect(sumMoney(["19.99", 0.01])).toBe(20);
  });

  it("toCents arredonda corretamente", () => {
    expect(toCents(19.99)).toBe(1999);
    expect(toCents("4.35")).toBe(435);
  });
});
