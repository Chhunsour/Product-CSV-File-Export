import { basename } from "node:path";
import type { RawInputItem } from "../types";

const fileToTitle = (filePath: string) =>
  basename(filePath)
    .replace(/\.docx$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

export const ingestDocx = async (
  docxPaths: string[],
  defaults?: Partial<RawInputItem>
): Promise<RawInputItem[]> => {
  if (!docxPaths.length) return [];

  let mammoth: typeof import("mammoth");
  try {
    mammoth = await import("mammoth");
  } catch {
    throw new Error(
      "DOCX ingestion requires the 'mammoth' package. Install with: npm i mammoth"
    );
  }

  const items: RawInputItem[] = [];

  for (const filePath of docxPaths) {
    const result = await mammoth.convertToHtml({ path: filePath });
    const rawText = await mammoth.extractRawText({ path: filePath });

    const title = defaults?.title || fileToTitle(filePath);
    const focus = defaults?.focus_keyword || title;

    items.push({
      ...defaults,
      title,
      focus_keyword: focus,
      source_text: rawText.value.trim(),
      summary: defaults?.summary,
      outline: result.value
    });
  }

  return items;
};
