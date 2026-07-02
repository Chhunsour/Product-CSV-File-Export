import { writeFile } from "node:fs/promises";
import type { CsvRoundtripReport, GeneratedRow } from "../types";

export const CSV_COLUMNS: Array<keyof GeneratedRow> = [
  "post_type",
  "post_status",
  "post_title",
  "post_name",
  "post_date",
  "post_content",
  "post_excerpt",
  "post_category",
  "post_tags",
  "featured_image_url",
  "featured_image_alt",
  "inline_image_urls",
  "inline_image_alts",
  "rank_math_title",
  "rank_math_description",
  "rank_math_focus_keyword",
  "rank_math_canonical_url",
  "rank_math_robots",
  "rank_math_facebook_title",
  "rank_math_facebook_description",
  "rank_math_facebook_image",
  "rank_math_twitter_title",
  "rank_math_twitter_description",
  "rank_math_twitter_image",
  "sku",
  "regular_price",
  "gtin",
  "product_short_description",
  "product_long_description",
  "gallery_image_urls",
  "gallery_image_alts"
];

const escapeCsv = (value: string) => {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const parseCsvStrict = (input: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let justClosedQuotedCell = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
    justClosedQuotedCell = false;
  };

  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
          justClosedQuotedCell = true;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      if (cell.length > 0) {
        throw new Error("Invalid RFC4180 CSV: unescaped quote inside unquoted field.");
      }
      inQuotes = true;
      continue;
    }

    if (justClosedQuotedCell && char !== "," && char !== "\n" && char !== "\r") {
      throw new Error("Invalid RFC4180 CSV: trailing characters after closing quote.");
    }

    if (char === ",") {
      pushCell();
      continue;
    }

    if (char === "\r" || char === "\n") {
      if (char === "\r" && input[i + 1] === "\n") {
        i += 1;
      }
      pushCell();
      pushRow();
      continue;
    }

    cell += char;
  }

  if (inQuotes) {
    throw new Error("Invalid RFC4180 CSV: unmatched quote.");
  }

  if (cell.length || row.length) {
    pushCell();
    pushRow();
  }

  if (!rows.length) {
    return { headers: [] as string[], rows: [] as string[][] };
  }

  const headers = [...rows[0]];
  headers[0] = headers[0]?.replace(/^\uFEFF/, "") || "";
  return {
    headers,
    rows: rows.slice(1)
  };
};

export const csvSafeForRow = (row: GeneratedRow) => {
  const header = CSV_COLUMNS.join(",");
  const line = CSV_COLUMNS.map((column) => escapeCsv(String(row[column] ?? ""))).join(",");
  try {
    const parsed = parseCsvStrict(`${header}\n${line}`);
    if (parsed.headers.length !== CSV_COLUMNS.length || parsed.rows.length !== 1) {
      return false;
    }
    return parsed.rows[0].length === CSV_COLUMNS.length;
  } catch {
    return false;
  }
};

export const toCsv = (rows: GeneratedRow[]) => {
  const header = CSV_COLUMNS.join(",");
  const body = rows.map((row) => CSV_COLUMNS.map((column) => escapeCsv(String(row[column] ?? ""))).join(",")).join("\n");
  return `${header}\n${body}`;
};

export const validateCsvRoundtrip = (rows: GeneratedRow[]): CsvRoundtripReport => {
  const csv = toCsv(rows);
  const errors: string[] = [];

  try {
    const parsed = parseCsvStrict(csv);
    let consistentColumnCount = true;

    if (parsed.headers.length !== CSV_COLUMNS.length) {
      errors.push(`Header column count mismatch: expected ${CSV_COLUMNS.length}, got ${parsed.headers.length}.`);
      consistentColumnCount = false;
    }

    for (let i = 0; i < CSV_COLUMNS.length; i += 1) {
      if (parsed.headers[i] !== CSV_COLUMNS[i]) {
        errors.push(`Header mismatch at column ${i + 1}: expected "${CSV_COLUMNS[i]}", got "${parsed.headers[i] ?? ""}".`);
      }
    }

    if (parsed.rows.length !== rows.length) {
      errors.push(`Row count mismatch after parse: expected ${rows.length}, got ${parsed.rows.length}.`);
    }

    const inspectLength = Math.min(parsed.rows.length, rows.length);
    for (let i = 0; i < inspectLength; i += 1) {
      const parsedRow = parsed.rows[i];
      const originalRow = rows[i];

      if (parsedRow.length !== CSV_COLUMNS.length) {
        errors.push(`Row ${i + 2} has ${parsedRow.length} columns; expected ${CSV_COLUMNS.length}.`);
        consistentColumnCount = false;
      }

      for (let c = 0; c < CSV_COLUMNS.length; c += 1) {
        const key = CSV_COLUMNS[c];
        const expected = String(originalRow[key] ?? "");
        const got = parsedRow[c] ?? "";
        if (expected !== got) {
          errors.push(`Roundtrip mismatch at row ${i + 2}, column "${key}".`);
          break;
        }
      }
    }

    return {
      roundtrip_ok: errors.length === 0,
      consistent_column_count: consistentColumnCount,
      errors,
      column_count: CSV_COLUMNS.length,
      row_count: parsed.rows.length
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return {
      roundtrip_ok: false,
      consistent_column_count: false,
      errors,
      column_count: CSV_COLUMNS.length,
      row_count: 0
    };
  }
};

export const writeCsv = async (rows: GeneratedRow[], outputPath: string) => {
  const csv = toCsv(rows);
  await writeFile(outputPath, csv, "utf8");
};
