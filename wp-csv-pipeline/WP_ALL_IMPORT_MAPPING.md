# WP All Import Mapping Checklist

## 1) Import settings
- File encoding: `UTF-8` (no BOM)
- Delimiter: `,`
- Text qualifier: `"`
- Multi-value separator for list fields: `|`

## 2) Core WordPress fields
- `post_type` -> Post Type
- `post_status` -> Status
- `post_title` -> Title
- `post_name` -> Slug
- `post_date` -> Date
- `post_content` -> Content
- `post_excerpt` -> Excerpt
- `post_category` -> Taxonomies > Categories
- `post_tags` -> Taxonomies > Tags

## 3) Taxonomy format rules expected by this CSV
- Multi categories: `Category A|Category B`
- Hierarchical path: `Parent > Child > Subchild`
- Multiple hierarchical paths: `Parent > Child|Another Parent > Child`

## 4) Images
- `featured_image_url` -> Featured image
- `inline_image_urls` -> Additional images (split by `|`)
- `gallery_image_urls` -> Product gallery images (split by `|`)
- `featured_image_alt` / `inline_image_alts` / `gallery_image_alts` -> import as custom fields if needed

## 5) Rank Math custom fields (post meta)
Map each CSV column as custom field with same key:
- `rank_math_title`
- `rank_math_description`
- `rank_math_focus_keyword`
- `rank_math_canonical_url`
- `rank_math_robots`
- `rank_math_facebook_title`
- `rank_math_facebook_description`
- `rank_math_facebook_image`
- `rank_math_twitter_title`
- `rank_math_twitter_description`
- `rank_math_twitter_image`

## 6) WooCommerce-specific fields (only for `post_type=product`)
- `sku` -> Woo SKU
- `regular_price` -> Regular price
- `gtin` -> custom field (or GTIN plugin field)
- `product_short_description` -> Short description
- `product_long_description` -> Long description

## 7) Pre-import checks
- Confirm WP All Import preview shows aligned columns.
- Confirm `post_tags` and `post_category` values use `|`, not commas.
- Confirm image URL fields and ALT fields have aligned counts.
