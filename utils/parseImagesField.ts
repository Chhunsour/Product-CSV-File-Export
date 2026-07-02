export const parseImagesField = (input: string | null | undefined): string[] => {
  if (!input) return [];
  const trimmed = input.trim();
  if (!trimmed) return [];

  const matches = trimmed.match(/https?:\/\/[^\s,|]+/g);
  const raw = matches?.length ? matches : trimmed.split(/[,|\n]+/g);
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const part of raw) {
    const value = part.trim().replace(/^"+|"+$/g, "");
    if (!value) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    urls.push(value);
  }

  return urls;
};
