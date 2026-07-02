import { basename } from "node:path";
import type { ContentType, LinkSuggestion, NormalizedItem, PipelineConfig, RawInputItem } from "../types";
import { dedupeSlug, ensureKeywordInSlug, slugify } from "./slugify";

const asStringArray = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter(Boolean);
  }
  return value
    .split(/\s*,\s*|\s*\|\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const normalizeCategoryPaths = (
  value: string | string[] | undefined,
  fallback: string
) => {
  const categories = asStringArray(value);
  if (!categories.length) {
    return [fallback.trim()].filter(Boolean);
  }
  return categories;
};

const toLinkSuggestion = (value: string | LinkSuggestion): LinkSuggestion => {
  if (typeof value === "string") return { url: value };
  return { url: value.url, anchor: value.anchor };
};

const sanitizeLinks = (values: Array<string | LinkSuggestion> | undefined): LinkSuggestion[] => {
  if (!values?.length) return [];
  return values
    .map(toLinkSuggestion)
    .filter((entry) => typeof entry.url === "string" && entry.url.trim().length > 0)
    .map((entry) => ({ url: entry.url.trim(), anchor: entry.anchor?.trim() || undefined }));
};

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const resolveImage = (value: string, config: PipelineConfig) => {
  if (isHttpUrl(value)) {
    return { url: value, unresolved: false };
  }

  if (config.local_image_mode === "base_url" && config.local_image_base_url) {
    const file = basename(value);
    return {
      url: `${config.local_image_base_url.replace(/\/$/, "")}/${encodeURIComponent(file)}`,
      unresolved: false
    };
  }

  return {
    url: `local-upload-required://${value}`,
    unresolved: true
  };
};

const normalizeDate = (value?: string) => {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
};

const normalizeType = (value: string | undefined, fallback: ContentType): ContentType => {
  return value === "product" ? "product" : value === "post" ? "post" : fallback;
};

export const normalizeItems = (
  items: RawInputItem[],
  config: PipelineConfig,
  defaultType: ContentType
): NormalizedItem[] => {
  const usedSlugs = new Set<string>();

  return items.map((item, index) => {
    if (!item.title?.trim()) {
      throw new Error(`Item ${index + 1} is missing title.`);
    }
    if (!item.focus_keyword?.trim()) {
      throw new Error(`Item ${item.title} is missing focus_keyword.`);
    }

    const postType = normalizeType(item.post_type, defaultType);
    const categories = normalizeCategoryPaths(item.category, config.default_category);
    const tags = asStringArray(item.tags);
    const mergedTags = Array.from(new Set([...config.default_tags, ...tags]));

    const baseSlug = slugify(item.slug || item.title);
    const slugWithKeyword = ensureKeywordInSlug(baseSlug, item.focus_keyword);
    const finalSlug = dedupeSlug(slugWithKeyword || `item-${index + 1}`, usedSlugs);

    const resolvedImages = (item.images ?? []).map((image) => resolveImage(image, config));
    const resolvedGallery = (item.gallery_images ?? []).map((image) => resolveImage(image, config));
    const featured = item.featured_image ? resolveImage(item.featured_image, config) : undefined;

    const unresolved = [
      ...resolvedImages.filter((image) => image.unresolved).map((image) => image.url.replace(/^local-upload-required:\/\//, "")),
      ...resolvedGallery.filter((image) => image.unresolved).map((image) => image.url.replace(/^local-upload-required:\/\//, "")),
      ...(featured?.unresolved ? [featured.url.replace(/^local-upload-required:\/\//, "")] : [])
    ];

    const internalLinks = sanitizeLinks(item.internal_links);
    const externalLinks = sanitizeLinks(item.external_links);

    return {
      id: item.id || `${postType}-${index + 1}`,
      post_type: postType,
      post_status: item.post_status?.trim() || config.default_post_status,
      title: item.title.trim(),
      focus_keyword: item.focus_keyword.trim(),
      category: categories.join("|"),
      tags: mergedTags,
      slug: finalSlug,
      summary: item.summary?.trim(),
      outline: item.outline?.trim(),
      source_text: item.source_text?.trim(),
      internal_links: internalLinks.length ? internalLinks : config.internal_links,
      external_links: externalLinks.length ? externalLinks : config.external_links,
      images: resolvedImages.map((image) => image.url),
      image_alts: item.image_alts ?? [],
      featured_image: featured?.url,
      author: item.author?.trim(),
      publish_date: normalizeDate(item.publish_date),
      canonical_url: item.canonical_url?.trim(),
      rank_math_robots: item.rank_math_robots?.trim() || "index,follow",
      sku: item.sku?.trim(),
      price: item.price !== undefined ? String(item.price).trim() : undefined,
      brand: item.brand?.trim(),
      model: item.model?.trim(),
      specs_bullets: item.specs_bullets ?? [],
      gtin: item.gtin?.trim(),
      gallery_images: resolvedGallery.map((image) => image.url),
      unresolved_local_images: unresolved
    };
  });
};
