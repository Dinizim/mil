import { describe, expect, it } from "vitest";

import { importKey, parseCSV, parseOFX, parseStatement, parseStatementDate } from "./import-statement";

const OFX_SGML = `OFXHEADER:100
DATA:OFXSGML
<OFX>
<BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260915120000[-3:BRT]
<TRNAMT>-85.50
<FITID>1
<MEMO>Mercado Bom Preço
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20260905
<TRNAMT>3000.00
<FITID>2
<NAME>Salário &amp; bônus
</STMTTRN>
</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1>
</OFX>`;

describe("parseOFX", () => {
  it("lê transações SGML com sinal", () => {
    const { rows, errors } = parseOFX(OFX_SGML);
    expect(errors).toEqual([]);
    expect(rows).toEqual([
      { date: "2026-09-15", amount: -85.5, description: "Mercado Bom Preço" },
      { date: "2026-09-05", amount: 3000, description: "Salário & bônus" },
    ]);
  });

  it("avisa quando não há transações", () => {
    expect(parseOFX("<OFX></OFX>").errors).toHaveLength(1);
  });
});

describe("parseCSV", () => {
  it("lê CSV brasileiro com ponto e vírgula", () => {
    const { rows, errors } = parseCSV('Data;Descrição;Valor\n15/09/2026;"Padaria; centro";-12,90\n05/09/2026;Salário;3.000,00\n');
    expect(errors).toEqual([]);
    expect(rows).toEqual([
      { date: "2026-09-15", amount: -12.9, description: "Padaria; centro" },
      { date: "2026-09-05", amount: 3000, description: "Salário" },
    ]);
  });

  it("lê CSV no formato do Nubank (vírgula e ISO)", () => {
    const { rows } = parseCSV("date,title,amount\n2026-09-10,Uber,23.50\n");
    expect(rows).toEqual([{ date: "2026-09-10", amount: 23.5, description: "Uber" }]);
  });

  it("aponta linhas inválidas e cabeçalho ausente", () => {
    expect(parseCSV("Data;Valor\n31/02/2026;10\n").errors).toEqual(["Linha 2: data ou valor inválido."]);
    expect(parseCSV("foo;bar\n1;2").errors[0]).toMatch(/colunas/);
  });
});

describe("utilitários", () => {
  it("parseStatementDate aceita formatos comuns", () => {
    expect(parseStatementDate("5/9/26")).toBe("2026-09-05");
    expect(parseStatementDate("20260931")).toBeNull();
  });

  it("importKey ignora acentos, caixa e espaços", () => {
    expect(importKey({ date: "2026-09-01", amount: -10, description: "  Pão  de Açúcar" })).toBe(
      importKey({ date: "2026-09-01", amount: -10.0, description: "pao de acucar" })
    );
  });

  it("parseStatement escolhe o leitor pelo arquivo", () => {
    expect(parseStatement("extrato.ofx", OFX_SGML).rows).toHaveLength(2);
    expect(parseStatement("extrato.csv", "Data;Valor\n01/09/2026;-5").rows).toHaveLength(1);
  });
});
