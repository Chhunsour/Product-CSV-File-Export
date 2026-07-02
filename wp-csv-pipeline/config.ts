import { readFile } from "node:fs/promises";
import type { PipelineConfig } from "./types";

export const defaultConfig: PipelineConfig = {
  site_base_url: "https://example.com",
  default_category: "General",
  default_tags: ["wordpress", "seo"],
  min_words_post: 350,
  min_words_product: 600,
  internal_links: [],
  external_links: [
    {
      url: "https://wordpress.org/documentation/",
      anchor: "WordPress documentation"
    }
  ],
  brand_voice: "Clear, practical, benefit-led.",
  cta_style: "Soft CTA encouraging readers to explore the product or topic.",
  default_post_status: "publish",
  excerpt_min_chars: 150,
  excerpt_max_chars: 200,
  local_image_mode: "placeholder"
};

const asLinkList = (value: unknown): PipelineConfig["internal_links"] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return { url: entry };
      }
      if (entry && typeof entry === "object" && typeof (entry as { url?: unknown }).url === "string") {
        const obj = entry as { url: string; anchor?: unknown };
        return { url: obj.url, anchor: typeof obj.anchor === "string" ? obj.anchor : undefined };
      }
      return null;
    })
    .filter((entry): entry is { url: string; anchor?: string } => Boolean(entry));
};

export const loadConfig = async (configPath?: string): Promise<PipelineConfig> => {
  if (!configPath) return defaultConfig;

  const raw = await readFile(configPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<PipelineConfig>;

  return {
    ...defaultConfig,
    ...parsed,
    default_tags: Array.isArray(parsed.default_tags)
      ? parsed.default_tags.filter((tag): tag is string => typeof tag === "string")
      : defaultConfig.default_tags,
    internal_links: asLinkList(parsed.internal_links),
    external_links: asLinkList(parsed.external_links)
  };
};
