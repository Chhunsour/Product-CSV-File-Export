export type ContentType = "post" | "product";

export type LinkSuggestion = {
  url: string;
  anchor?: string;
};

export type RawInputItem = {
  id?: string;
  post_type?: ContentType;
  post_status?: string;
  title: string;
  focus_keyword: string;
  category?: string | string[];
  tags?: string | string[];
  slug?: string;
  summary?: string;
  outline?: string;
  source_text?: string;
  internal_links?: Array<string | LinkSuggestion>;
  external_links?: Array<string | LinkSuggestion>;
  images?: string[];
  image_alts?: string[];
  featured_image?: string;
  author?: string;
  publish_date?: string;
  canonical_url?: string;
  rank_math_robots?: string;
  sku?: string;
  price?: string | number;
  brand?: string;
  model?: string;
  specs_bullets?: string[];
  gtin?: string;
  gallery_images?: string[];
};

export type PipelineConfig = {
  site_base_url: string;
  default_category: string;
  default_tags: string[];
  min_words_post: number;
  min_words_product: number;
  internal_links: LinkSuggestion[];
  external_links: LinkSuggestion[];
  brand_voice: string;
  cta_style: string;
  default_post_status: string;
  excerpt_min_chars: number;
  excerpt_max_chars: number;
  local_image_mode: "placeholder" | "base_url";
  local_image_base_url?: string;
};

export type NormalizedItem = {
  id: string;
  post_type: ContentType;
  post_status: string;
  title: string;
  focus_keyword: string;
  category: string;
  tags: string[];
  slug: string;
  summary?: string;
  outline?: string;
  source_text?: string;
  internal_links: LinkSuggestion[];
  external_links: LinkSuggestion[];
  images: string[];
  image_alts: string[];
  featured_image?: string;
  author?: string;
  publish_date?: string;
  canonical_url?: string;
  rank_math_robots: string;
  sku?: string;
  price?: string;
  brand?: string;
  model?: string;
  specs_bullets: string[];
  gtin?: string;
  gallery_images: string[];
  unresolved_local_images: string[];
};

export type GeneratedRow = {
  post_type: string;
  post_status: string;
  post_title: string;
  post_name: string;
  post_date: string;
  post_content: string;
  post_excerpt: string;
  post_category: string;
  post_tags: string;
  featured_image_url: string;
  featured_image_alt: string;
  inline_image_urls: string;
  inline_image_alts: string;
  rank_math_title: string;
  rank_math_description: string;
  rank_math_focus_keyword: string;
  rank_math_canonical_url: string;
  rank_math_robots: string;
  rank_math_facebook_title: string;
  rank_math_facebook_description: string;
  rank_math_facebook_image: string;
  rank_math_twitter_title: string;
  rank_math_twitter_description: string;
  rank_math_twitter_image: string;
  sku: string;
  regular_price: string;
  gtin: string;
  product_short_description: string;
  product_long_description: string;
  gallery_image_urls: string;
  gallery_image_alts: string;
};

export type RuleResult = {
  taxonomy_pipe_separator_only: boolean;
  taxonomy_hierarchy_format_valid: boolean;
  image_alt_alignment_valid: boolean;
  keyword_in_seo_title: boolean;
  keyword_in_meta_description: boolean;
  keyword_in_slug: boolean;
  keyword_in_first_sentence: boolean;
  keyword_in_headings: boolean;
  keyword_in_image_alt: boolean;
  internal_link_present: boolean;
  external_link_present: boolean;
  min_word_count_met: boolean;
  csv_safe: boolean;
};

export type ValidationResult = {
  id: string;
  post_title: string;
  post_type: ContentType;
  focus_keyword: string;
  rules: RuleResult;
  estimated_rank_math_readiness_score: number;
  rank_math_ready: boolean;
  word_count: number;
  min_word_target: number;
  unresolved_local_images: string[];
  notes: string[];
};

export type CsvRoundtripReport = {
  roundtrip_ok: boolean;
  consistent_column_count: boolean;
  errors: string[];
  column_count: number;
  row_count: number;
};

export type PipelineRunResult = {
  rows: GeneratedRow[];
  validations: ValidationResult[];
  csv_roundtrip: CsvRoundtripReport;
  blocking_errors: string[];
  summary: {
    total: number;
    ready_count: number;
    average_score: number;
    score_formula: string;
  };
};
