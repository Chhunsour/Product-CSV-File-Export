import { readFile } from "node:fs/promises";
import type { RawInputItem } from "../types";

export const ingestJson = async (inputPath: string): Promise<RawInputItem[]> => {
  const raw = await readFile(inputPath, "utf8");
  const parsed = JSON.parse(raw) as RawInputItem[] | { items?: RawInputItem[] };

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (parsed && Array.isArray(parsed.items)) {
    return parsed.items;
  }

  throw new Error("Invalid JSON input. Expected array or { items: [...] }.");
};
