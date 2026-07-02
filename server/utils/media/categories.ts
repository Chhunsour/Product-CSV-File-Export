import { slugify } from "~/utils/slug";

export const KNOWN_CATEGORIES = [
  "mini-excavator",
  "forklift",
  "road-roller",
  "skid-steer",
  "attachments"
];

const normalizeRaw = (value?: string | null) => {
  if (!value) return "";
  return slugify(value).replace(/_/g, "-");
};

export const normalizeCategory = (value?: string | null) => {
  const slug = normalizeRaw(value);
  if (!slug) return "";
  const match = KNOWN_CATEGORIES.find((known) => slug.includes(known));
  return match || slug;
};

export const inferCategory = (values: Array<string | null | undefined>) => {
  for (const value of values) {
    const normalized = normalizeCategory(value);
    if (normalized) return normalized;
  }
  return "";
};
