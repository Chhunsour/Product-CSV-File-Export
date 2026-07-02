import { readFile } from "node:fs/promises";
import type { RawInputItem } from "../types";

const parseCsv = (input: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushRow = () => {
    row.push(cell);
    const hasContent = row.some((value) => value.trim().length > 0);
    if (hasContent) rows.push(row);
    row = [];
    cell = "";
  };

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (char === '"') {
      if (inQuotes && input[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && input[i + 1] === "\n") {
        i += 1;
      }
      pushRow();
      continue;
    }

    cell += char;
  }

  if (cell.length || row.length) {
    pushRow();
  }

  if (!rows.length) return { headers: [] as string[], rows: [] as string[][] };

  const headers = rows.shift() ?? [];
  if (headers.length) {
    headers[0] = headers[0].replace(/^\uFEFF/, "");
  }

  return { headers, rows };
};

const toList = (value: string) =>
  value
    .split(/\s*\|\s*|\s*,\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean);

export const ingestCsv = async (inputPath: string): Promise<RawInputItem[]> => {
  const raw = await readFile(inputPath, "utf8");
  const parsed = parseCsv(raw);
  if (!parsed.headers.length) {
    throw new Error("CSV has no headers.");
  }

  return parsed.rows.map((row) => {
    const valueFor = (key: string) => {
      const index = parsed.headers.findIndex((header) => header.trim().toLowerCase() === key);
      return index === -1 ? "" : (row[index] ?? "").trim();
    };

    const images = toList(valueFor("images") || valueFor("inline_image_urls"));
    const gallery = toList(valueFor("gallery_images") || valueFor("gallery_image_urls"));

    return {
      post_type: (valueFor("post_type") as "post" | "product") || undefined,
      title: valueFor("title") || valueFor("post_title"),
      focus_keyword:
        valueFor("focus_keyword") ||
        valueFor("rank_math_focus_keyword") ||
        valueFor("keyword"),
      category: valueFor("category") || valueFor("post_category"),
      tags: valueFor("tags") || valueFor("post_tags"),
      slug: valueFor("slug") || valueFor("post_name"),
      summary: valueFor("summary") || valueFor("post_excerpt"),
      source_text: valueFor("source_text") || valueFor("post_content"),
      featured_image: valueFor("featured_image") || valueFor("featured_image_url"),
      images,
      gallery_images: gallery,
      author: valueFor("author"),
      publish_date: valueFor("publish_date") || valueFor("post_date"),
      sku: valueFor("sku"),
      price: valueFor("price") || valueFor("regular_price"),
      gtin: valueFor("gtin"),
      brand: valueFor("brand"),
      model: valueFor("model")
    } satisfies RawInputItem;
  });
};
