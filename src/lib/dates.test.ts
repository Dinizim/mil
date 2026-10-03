import { describe, expect, it } from "vitest";

import { daysBetween, isValidDate, monthRange, resolveMonth, shiftMonth, todayISO } from "./dates";

describe("todayISO", () => {
  it("usa o fuso de São Paulo, não UTC (bug das 21h)", () => {
    // 22h em São Paulo = 01h do dia seguinte em UTC.
    expect(todayISO(new Date("2026-09-30T01:00:00Z"))).toBe("2026-09-29");
    expect(todayISO(new Date("2026-09-30T15:00:00Z"))).toBe("2026-09-30");
  });
});

describe("isValidDate", () => {
  it("valida datas reais", () => {
    expect(isValidDate("2026-02-28")).toBe(true);
    expect(isValidDate("2028-02-29")).toBe(true);
  });

  it("rejeita datas impossíveis ou mal formatadas", () => {
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("2026-13-01")).toBe(false);
    expect(isValidDate("30/09/2026")).toBe(false);
    expect(isValidDate(null)).toBe(false);
  });
});

describe("meses", () => {
  it("shiftMonth atravessa anos", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-09", -12)).toBe("2025-09");
  });

  it("monthRange devolve [início, próximo mês)", () => {
    expect(monthRange("2026-12")).toEqual({ start: "2026-12-01", end: "2027-01-01" });
  });

  it("resolveMonth ignora valores inválidos", () => {
    expect(resolveMonth("2026-05")).toBe("2026-05");
    expect(resolveMonth(["2026-04", "2026-05"])).toBe("2026-04");
    expect(resolveMonth("2026-13")).toMatch(/^\d{4}-\d{2}$/);
  });

  it("daysBetween conta dias de calendário", () => {
    expect(daysBetween("2026-09-01", "2026-09-30")).toBe(29);
    expect(daysBetween("2026-09-30", "2026-09-01")).toBe(-29);
  });
});
