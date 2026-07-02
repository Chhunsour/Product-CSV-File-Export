import type { GeneratedRow, NormalizedItem, PipelineConfig, RuleResult, ValidationResult } from "../types";
import { csvSafeForRow } from "../export/csv";

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const firstSentence = (html: string) => {
  const text = stripHtml(html);
  const match = text.match(/[^.!?]+[.!?]/);
  return match ? match[0].trim() : text;
};

const headingText = (html: string) => {
  const matches = html.match(/<h[23][^>]*>(.*?)<\/h[23]>/gi) || [];
  return matches.map((entry) => stripHtml(entry)).join(" ");
};

const hasExternalLink = (html: string, siteBaseUrl: string) => {
  const hrefs = Array.from(html.matchAll(/<a\s+[^>]*href="([^"]+)"/gi)).map((match) => match[1]);
  const siteHost = new URL(siteBaseUrl).host;
  return hrefs.some((href) => {
    if (!/^https?:\/\//i.test(href)) return false;
    try {
      return new URL(href).host !== siteHost;
    } catch {
      return false;
    }
  });
};

const hasInternalLink = (html: string, siteBaseUrl: string) => {
  const hrefs = Array.from(html.matchAll(/<a\s+[^>]*href="([^"]+)"/gi)).map((match) => match[1]);
  const siteHost = new URL(siteBaseUrl).host;
  return hrefs.some((href) => {
    try {
      const resolved = href.startsWith("http") ? new URL(href) : new URL(href, siteBaseUrl);
      return resolved.host === siteHost;
    } catch {
      return false;
    }
  });
};

const countWords = (html: string) => {
  const text = stripHtml(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
};

const contains = (value: string, keyword: string) =>
  value.toLowerCase().includes(keyword.toLowerCase());

const splitPipeValues = (value: string) =>
  value
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);

const hasCommaSeparatedValues = (value: string) => value.includes(",");

const isHierarchyPathValid = (path: string) => {
  if (!path.includes(">")) return true;
  return /^[^>|]+(?: > [^>|]+)+$/.test(path.trim());
};

const taxonomyPipeOnly = (category: string, tags: string) =>
  !hasCommaSeparatedValues(category) && !hasCommaSeparatedValues(tags);

const taxonomyHierarchyValid = (category: string) => {
  const paths = splitPipeValues(category);
  if (!paths.length) return false;
  return paths.every(isHierarchyPathValid);
};

const imageAlignmentValid = (row: GeneratedRow) => {
  const inlineUrls = splitPipeValues(row.inline_image_urls);
  const inlineAlts = splitPipeValues(row.inline_image_alts);
  const galleryUrls = splitPipeValues(row.gallery_image_urls);
  const galleryAlts = splitPipeValues(row.gallery_image_alts);

  const featuredOk = row.featured_image_url ? row.featured_image_alt.trim().length > 0 : true;
  const inlineOk = inlineUrls.length === inlineAlts.length;
  const galleryOk = galleryUrls.length === galleryAlts.length;
  return featuredOk && inlineOk && galleryOk;
};

const scoreFromRules = (rules: RuleResult) => {
  const entries = [
    rules.keyword_in_seo_title,
    rules.keyword_in_meta_description,
    rules.keyword_in_slug,
    rules.keyword_in_first_sentence,
    rules.keyword_in_headings,
    rules.keyword_in_image_alt,
    rules.internal_link_present,
    rules.external_link_present
  ];
  const passed = entries.filter(Boolean).length;
  const total = entries.length;
  return Math.round((passed / total) * 100);
};

export const validateRow = (
  row: GeneratedRow,
  item: NormalizedItem,
  config: PipelineConfig
): ValidationResult => {
  const keyword = row.rank_math_focus_keyword;
  const minWordTarget = item.post_type === "product" ? config.min_words_product : config.min_words_post;
  const words = countWords(row.post_content);

  const allAlts = [row.featured_image_alt, row.inline_image_alts, row.gallery_image_alts].join(" ");

  const rules: RuleResult = {
    taxonomy_pipe_separator_only: taxonomyPipeOnly(row.post_category, row.post_tags),
    taxonomy_hierarchy_format_valid: taxonomyHierarchyValid(row.post_category),
    image_alt_alignment_valid: imageAlignmentValid(row),
    keyword_in_seo_title: contains(row.rank_math_title, keyword),
    keyword_in_meta_description: contains(row.rank_math_description, keyword),
    keyword_in_slug: contains(row.post_name, keyword.replace(/\s+/g, "-")),
    keyword_in_first_sentence: contains(firstSentence(row.post_content), keyword),
    keyword_in_headings: contains(headingText(row.post_content), keyword),
    keyword_in_image_alt: contains(allAlts, keyword),
    internal_link_present: hasInternalLink(row.post_content, config.site_base_url),
    external_link_present: hasExternalLink(row.post_content, config.site_base_url),
    min_word_count_met: words >= minWordTarget,
    csv_safe: csvSafeForRow(row)
  };

  const notes: string[] = [];
  if (!rules.taxonomy_pipe_separator_only) {
    notes.push("Taxonomy uses commas; WP All Import multi-values must use pipe (|).");
  }
  if (!rules.taxonomy_hierarchy_format_valid) {
    notes.push('Category hierarchy format invalid. Use "Parent > Child" and separate paths with pipe.');
  }
  if (!rules.image_alt_alignment_valid) {
    notes.push("Image URL and ALT counts do not align.");
  }
  if (item.post_type === "product" && !row.gtin.trim()) {
    notes.push("GTIN missing for product row.");
  }
  if (item.unresolved_local_images.length) {
    notes.push(`${item.unresolved_local_images.length} local image(s) still require upload mapping.`);
  }

  const score = scoreFromRules(rules);

  return {
    id: item.id,
    post_title: row.post_title,
    post_type: item.post_type,
    focus_keyword: keyword,
    rules,
    estimated_rank_math_readiness_score: score,
    rank_math_ready: score >= 70,
    word_count: words,
    min_word_target: minWordTarget,
    unresolved_local_images: item.unresolved_local_images,
    notes
  };
};
