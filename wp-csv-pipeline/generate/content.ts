import type { GeneratedRow, NormalizedItem, PipelineConfig } from "../types";

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const wordCount = (value: string) => {
  if (!value.trim()) return 0;
  return stripHtml(value)
    .split(/\s+/)
    .filter(Boolean).length;
};

const excerptFromText = (
  text: string,
  focusKeyword: string,
  minChars: number,
  maxChars: number
) => {
  let base = stripHtml(text);
  if (!base.toLowerCase().includes(focusKeyword.toLowerCase())) {
    base = `${focusKeyword}. ${base}`;
  }
  if (base.length < minChars) {
    base = `${base} Learn practical steps, key details, and implementation guidance for reliable publishing results.`;
  }
  if (base.length <= maxChars) {
    return base;
  }
  const clipped = base.slice(0, maxChars);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, Math.max(lastSpace, 120)).trim()}...`;
};

const titleCase = (value: string) =>
  value
    .split(/\s+/)
    .map((chunk) => (chunk ? chunk[0].toUpperCase() + chunk.slice(1) : chunk))
    .join(" ");

const linkHtml = (url: string, anchor: string) => `<a href="${url}">${anchor}</a>`;

const fallbackSpecs = (item: NormalizedItem) => {
  const lines: string[] = [];
  if (item.brand) lines.push(`Brand: ${item.brand}`);
  if (item.model) lines.push(`Model: ${item.model}`);
  if (item.sku) lines.push(`SKU: ${item.sku}`);
  if (item.gtin) lines.push(`GTIN: ${item.gtin}`);
  if (item.price) lines.push(`Price reference: ${item.price}`);
  return lines;
};

const ensureKeywordInFirstImageAlt = (alts: string[], keyword: string) => {
  if (!alts.length) return [`${keyword} featured image`];
  const hasKeyword = alts.some((alt) => alt.toLowerCase().includes(keyword.toLowerCase()));
  if (hasKeyword) return alts;
  return [
    `${keyword} product photo`,
    ...alts.slice(1)
  ];
};

const buildAlts = (
  item: NormalizedItem,
  imageUrls: string[],
  options?: {
    allowPlaceholderWhenEmpty?: boolean;
  }
) => {
  const keyword = item.focus_keyword;
  const generated = imageUrls.map((_, index) => {
    const existing = item.image_alts[index]?.trim();
    if (existing) return existing;
    if (index === 0) {
      return `${keyword} - ${item.title} main image`;
    }
    return `${item.title} image ${index + 1}`;
  });

  if (!generated.length) {
    if (options?.allowPlaceholderWhenEmpty) {
      return [`${keyword} image placeholder`];
    }
    return [];
  }

  return ensureKeywordInFirstImageAlt(generated, keyword);
};

const buildPostContent = (item: NormalizedItem, config: PipelineConfig) => {
  const keyword = item.focus_keyword;
  const internal = item.internal_links[0] ?? {
    url: `${config.site_base_url.replace(/\/$/, "")}/blog`,
    anchor: "related guides"
  };
  const external = item.external_links[0] ?? {
    url: "https://wordpress.org/documentation/",
    anchor: "WordPress documentation"
  };

  const intro = `<p>${keyword} is the focus of this guide, helping readers understand ${item.title.toLowerCase()} with practical next steps.</p>`;
  const sectionA = `<h2>${titleCase(keyword)}: what matters most</h2>`;
  const sourceText = item.source_text
    ? `<p>${item.source_text}</p>`
    : `<p>This article explains key context, common mistakes, and decision criteria for teams publishing at scale.</p>`;

  const points = [
    `Align every section around ${keyword}.`,
    `Keep content scannable with clear headings and bullet points.`,
    `Include internal and external references for trust and crawl clarity.`
  ];

  const list = `<ul>${points.map((point) => `<li>${point}</li>`).join("")}</ul>`;

  const links = `<p>For deeper context, review ${linkHtml(
    internal.url,
    internal.anchor || "internal documentation"
  )} and ${linkHtml(external.url, external.anchor || "trusted reference")}. </p>`;

  const close = `<h3>Implementation note</h3><p>${config.brand_voice} ${config.cta_style}</p>`;

  return `${intro}\n${sectionA}\n${sourceText}\n${list}\n${links}\n${close}`;
};

const buildProductContent = (item: NormalizedItem, config: PipelineConfig) => {
  const keyword = item.focus_keyword;
  const specs = item.specs_bullets.length ? item.specs_bullets : fallbackSpecs(item);
  const internal = item.internal_links[0] ?? {
    url: `${config.site_base_url.replace(/\/$/, "")}/products`,
    anchor: "compatible product line"
  };
  const external = item.external_links[0] ?? {
    url: "https://woocommerce.com/document/",
    anchor: "WooCommerce best practices"
  };

  const intro = `<p>${keyword} is built into this product strategy from the first sentence so both shoppers and search engines understand the core offer immediately.</p>`;
  const heading = `<h2>${titleCase(keyword)} product overview</h2>`;
  const summary = `<p>${item.summary || `${item.title} is designed for buyers who need durable performance, predictable operation, and clear support information before ordering.`}</p>`;

  const specList = `<h3>Specifications</h3><ul>${specs
    .map((spec) => `<li>${spec}</li>`)
    .join("")}</ul>`;

  const useCases = `<h3>Use cases</h3><ul>
<li>Daily commercial usage where reliability and easy maintenance are required.</li>
<li>Teams standardizing operations and spare-part workflows.</li>
<li>Buyers comparing lifecycle value, not just upfront price.</li>
</ul>`;

  const faq = `<h3>FAQs</h3>
<p><strong>Is this suitable for long-term use?</strong> Yes. This configuration is positioned for consistent duty cycles and routine maintenance schedules.</p>
<p><strong>How should I compare this model?</strong> Use the included specification list, warranty terms, and total cost of ownership criteria.</p>
<p><strong>Where can I review setup guidance?</strong> See ${linkHtml(
    internal.url,
    internal.anchor || "internal setup notes"
  )} and ${linkHtml(external.url, external.anchor || "industry reference")}. </p>`;

  const whyChoose = `<h3>Why choose this model</h3><p>${item.title} combines practical specifications, documented compatibility, and a buyer-first information structure. ${config.cta_style}</p>`;

  return [intro, heading, summary, specList, useCases, faq, whyChoose].join("\n");
};

const padToWordTarget = (html: string, minWords: number, keyword: string) => {
  let content = html;
  while (wordCount(content) < minWords) {
    content += `\n<p>${keyword} buyers typically compare efficiency, reliability, service coverage, and resale value before final purchase decisions. This section reinforces those criteria with transparent details and implementation guidance for real-world teams.</p>`;
  }
  return content;
};

const seoTitle = (item: NormalizedItem) => {
  const title = `${item.focus_keyword} | ${item.title}`;
  return title.length > 65 ? `${title.slice(0, 62).trim()}...` : title;
};

const seoDescription = (item: NormalizedItem, excerpt: string) => {
  const text = `${item.focus_keyword}: ${excerpt}`.replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).trim()}...`;
};

export const buildRow = (item: NormalizedItem, config: PipelineConfig): GeneratedRow => {
  const minWords = item.post_type === "product" ? config.min_words_product : config.min_words_post;
  const contentBase =
    item.post_type === "product"
      ? buildProductContent(item, config)
      : buildPostContent(item, config);

  const postContent = padToWordTarget(contentBase, minWords, item.focus_keyword);
  const excerpt = excerptFromText(postContent, item.focus_keyword, config.excerpt_min_chars, config.excerpt_max_chars);

  const featuredImage = item.featured_image || item.images[0] || "";
  const inlineImages = item.images.length > 1 ? item.images.slice(1) : item.images;
  const inlineAlts = buildAlts(item, inlineImages);
  const featuredAlt =
    buildAlts(item, featuredImage ? [featuredImage] : [], { allowPlaceholderWhenEmpty: true })[0] ||
    `${item.focus_keyword} featured image`;

  const galleryImages = item.post_type === "product"
    ? (item.gallery_images.length ? item.gallery_images : inlineImages)
    : [];
  const galleryAlts = buildAlts(item, galleryImages);

  const canonical =
    item.canonical_url || `${config.site_base_url.replace(/\/$/, "")}/${item.post_type === "post" ? "blog" : "product"}/${item.slug}/`;

  const rankMathTitle = seoTitle(item);
  const rankMathDescription = seoDescription(item, excerpt);

  return {
    post_type: item.post_type,
    post_status: item.post_status,
    post_title: item.title,
    post_name: item.slug,
    post_date: item.publish_date || new Date().toISOString(),
    post_content: postContent,
    post_excerpt: excerpt,
    post_category: item.category,
    post_tags: item.tags.join("|"),
    featured_image_url: featuredImage,
    featured_image_alt: featuredAlt,
    inline_image_urls: inlineImages.join("|"),
    inline_image_alts: inlineAlts.join("|"),
    rank_math_title: rankMathTitle,
    rank_math_description: rankMathDescription,
    rank_math_focus_keyword: item.focus_keyword,
    rank_math_canonical_url: canonical,
    rank_math_robots: item.rank_math_robots,
    rank_math_facebook_title: rankMathTitle,
    rank_math_facebook_description: rankMathDescription,
    rank_math_facebook_image: featuredImage,
    rank_math_twitter_title: rankMathTitle,
    rank_math_twitter_description: rankMathDescription,
    rank_math_twitter_image: featuredImage,
    sku: item.post_type === "product" ? item.sku || "" : "",
    regular_price: item.post_type === "product" ? item.price || "" : "",
    gtin: item.post_type === "product" ? (item.gtin || "") : "",
    product_short_description: item.post_type === "product" ? excerpt : "",
    product_long_description: item.post_type === "product" ? postContent : "",
    gallery_image_urls: item.post_type === "product" ? galleryImages.join("|") : "",
    gallery_image_alts: item.post_type === "product" ? galleryAlts.join("|") : ""
  };
};
