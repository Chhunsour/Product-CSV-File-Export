export const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const ensureKeywordInSlug = (baseSlug: string, keyword: string) => {
  const keywordSlug = slugify(keyword);
  if (!keywordSlug) return baseSlug;
  if (baseSlug.includes(keywordSlug)) return baseSlug;
  return slugify(`${keywordSlug}-${baseSlug}`);
};

export const dedupeSlug = (slug: string, used: Set<string>) => {
  if (!used.has(slug)) {
    used.add(slug);
    return slug;
  }

  let counter = 2;
  let candidate = `${slug}-${counter}`;
  while (used.has(candidate)) {
    counter += 1;
    candidate = `${slug}-${counter}`;
  }
  used.add(candidate);
  return candidate;
};
