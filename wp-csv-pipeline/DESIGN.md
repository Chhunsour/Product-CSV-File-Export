# WP All Import CSV Pipeline (TypeScript, No PHP)

## Architecture
1. `ingest/`
- `json.ts`, `csv.ts`, `docx.ts`
- Loads source rows into a shared `RawInputItem` schema.

2. `transform/`
- `normalize.ts`: normalizes categories/tags/images/links and applies defaults.
- `slugify.ts`: lowercase + hyphen slug, focus-keyword enforcement, de-duplication.

3. `generate/`
- `content.ts`: generates `post_content` HTML plus excerpt, image ALT fields, Rank Math fields.
- Uses pipe (`|`) for all multi-value WP All Import fields.

4. `seo/`
- `validate.ts`: row-level checks for:
  - taxonomy separators + hierarchy format
  - image URL/ALT alignment
  - Rank Math keyword placement and link coverage
  - row CSV safety

5. `export/`
- `csv.ts`: strict RFC4180 writer + strict parser + roundtrip validation.
- Roundtrip test:
  - Build CSV
  - Parse CSV with strict parser
  - Verify header count, row count, and per-cell equality

6. `index.ts`
- `evaluatePipeline(...)`: generates rows + validations + CSV roundtrip report.
- `runPipeline(...)`: blocks export if import-breaking errors exist, then writes CSV.

## Data Flow
Input JSON/CSV/DOCX -> Normalize -> Generate row objects -> Validate rows + RFC4180 roundtrip -> Export CSV.

## CLI
Build CSV:
```bash
node wp-csv-pipeline/cli.js build \
  --input wp-csv-pipeline/examples/input.wpai.sample.json \
  --output wp-csv-pipeline/examples/output.wpai.sample.csv \
  --type post \
  --config wp-csv-pipeline/examples/config.sample.json
```

Validate only:
```bash
node wp-csv-pipeline/cli.js validate \
  --input wp-csv-pipeline/examples/input.wpai.sample.json \
  --type post \
  --report wp-csv-pipeline/examples/report.wpai.sample.json \
  --config wp-csv-pipeline/examples/config.sample.json
```

## Import-blocking checks
- RFC4180 strict parse pass
- consistent header/column counts
- taxonomy pipe separator usage
- hierarchy format (`Parent > Child`)
- image URL/ALT count alignment

## Rank Math readiness score
- Score = `(passed SEO rules / total SEO rules) * 100`
- Ready threshold = `>= 70`

## Mapping
See `/Users/sour/Documents/csv website generator/workspace-catalog/wp-csv-pipeline/WP_ALL_IMPORT_MAPPING.md`.
