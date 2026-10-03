import { isValidDate } from "./dates";
import { parseMoney, toCents } from "./money";

/** Linha de extrato: valor negativo = saída, positivo = entrada. */
export type StatementRow = { date: string; amount: number; description: string };

export type ParseResult = { rows: StatementRow[]; errors: string[] };

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Chave usada para detectar duplicadas: data + valor + descrição. */
export function importKey(row: StatementRow): string {
  return `${row.date}|${toCents(row.amount)}|${normalizeText(row.description)}`;
}

/** Converte "15/09/2026", "15/09/26", "2026-09-15" ou "20260915..." em YYYY-MM-DD. */
export function parseStatementDate(value: string): string | null {
  const text = value.trim();
  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return isValidDate(match[0]) ? match[0] : null;

  match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (match) {
    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
    const date = `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
    return isValidDate(date) ? date : null;
  }

  match = text.match(/^(\d{4})(\d{2})(\d{2})/);
  if (match) {
    const date = `${match[1]}-${match[2]}-${match[3]}`;
    return isValidDate(date) ? date : null;
  }

  return null;
}

function readOfxTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}>([^<\\r\\n]*)`, "i"));
  return match ? match[1].trim() : "";
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'");
}

/** Lê extratos OFX (SGML ou XML), formato exportado por quase todo banco brasileiro. */
export function parseOFX(content: string): ParseResult {
  const rows: StatementRow[] = [];
  const errors: string[] = [];
  const blocks = content.split(/<STMTTRN>/i).slice(1);

  blocks.forEach((rawBlock, index) => {
    const block = rawBlock.split(/<\/STMTTRN>/i)[0];
    const date = parseStatementDate(readOfxTag(block, "DTPOSTED"));
    const amount = parseMoney(readOfxTag(block, "TRNAMT"));
    const description = decodeEntities(readOfxTag(block, "MEMO") || readOfxTag(block, "NAME"));

    if (!date || amount === null || amount === 0) {
      errors.push(`Transação ${index + 1}: data ou valor inválido.`);
      return;
    }
    rows.push({ date, amount, description: description.slice(0, 200) });
  });

  if (blocks.length === 0) errors.push("Nenhuma transação encontrada no arquivo OFX.");
  return { rows, errors };
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  fields.push(current.trim());
  return fields;
}

const DATE_HEADERS = ["data", "date", "data lancamento", "data da transacao", "dt"];
const DESCRIPTION_HEADERS = ["descricao", "historico", "title", "lancamento", "memo", "estabelecimento", "description", "detalhes"];
const AMOUNT_HEADERS = ["valor", "amount", "value", "valor (r$)", "quantia"];

function findColumn(headers: string[], candidates: string[]): number {
  const exact = headers.findIndex((header) => candidates.includes(header));
  if (exact > -1) return exact;
  return headers.findIndex((header) => candidates.some((candidate) => header.startsWith(candidate)));
}

/**
 * Lê CSV de extrato com cabeçalho. Detecta ";" ou "," e procura as colunas
 * de data, descrição e valor pelos nomes mais comuns dos bancos.
 */
export function parseCSV(content: string): ParseResult {
  const lines = content.replace(/^﻿/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { rows: [], errors: ["O arquivo CSV precisa de cabeçalho e ao menos uma linha."] };

  const headerLine = lines[0];
  const delimiter = (headerLine.match(/;/g)?.length ?? 0) >= (headerLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const headers = splitCsvLine(headerLine, delimiter).map((header) => normalizeText(header.replace(/"/g, "")));

  const dateIndex = findColumn(headers, DATE_HEADERS);
  const descriptionIndex = findColumn(headers, DESCRIPTION_HEADERS);
  const amountIndex = findColumn(headers, AMOUNT_HEADERS);

  if (dateIndex < 0 || amountIndex < 0) {
    return { rows: [], errors: ["Não encontrei as colunas de data e valor. Use um cabeçalho como: Data;Descrição;Valor"] };
  }

  const rows: StatementRow[] = [];
  const errors: string[] = [];

  lines.slice(1).forEach((line, index) => {
    const fields = splitCsvLine(line, delimiter);
    const date = parseStatementDate(fields[dateIndex] ?? "");
    const amount = parseMoney(fields[amountIndex] ?? "");
    const description = descriptionIndex > -1 ? (fields[descriptionIndex] ?? "") : "";

    if (!date || amount === null || amount === 0) {
      errors.push(`Linha ${index + 2}: data ou valor inválido.`);
      return;
    }
    rows.push({ date, amount, description: description.slice(0, 200) });
  });

  return { rows, errors };
}

export function parseStatement(fileName: string, content: string): ParseResult {
  const isOFX = /\.ofx$/i.test(fileName) || /<OFX>/i.test(content);
  return isOFX ? parseOFX(content) : parseCSV(content);
}
