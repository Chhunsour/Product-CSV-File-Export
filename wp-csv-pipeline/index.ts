import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ContentType, PipelineRunResult, RawInputItem } from "./types";
import type { PipelineConfig } from "./types";
import { normalizeItems } from "./transform/normalize";
import { buildRow } from "./generate/content";
import { validateRow } from "./seo/validate";
import { validateCsvRoundtrip, writeCsv } from "./export/csv";

export const collectBlockingErrors = (result: PipelineRunResult) => {
  const errors: string[] = [];

  if (!result.csv_roundtrip.roundtrip_ok) {
    errors.push(...result.csv_roundtrip.errors);
  }

  result.validations.forEach((entry, index) => {
    if (!entry.rules.csv_safe) {
      errors.push(`Row ${index + 1}: CSV escaping is unsafe.`);
    }
    if (!entry.rules.taxonomy_pipe_separator_only) {
      errors.push(`Row ${index + 1}: Taxonomy separator must be pipe (|), not comma.`);
    }
    if (!entry.rules.taxonomy_hierarchy_format_valid) {
      errors.push(`Row ${index + 1}: Category hierarchy must use "Parent > Child" format.`);
    }
    if (!entry.rules.image_alt_alignment_valid) {
      errors.push(`Row ${index + 1}: Image URL and ALT counts must align 1:1.`);
    }
  });

  return errors;
};

export const evaluatePipeline = (
  items: RawInputItem[],
  config: PipelineConfig,
  defaultType: ContentType
): PipelineRunResult => {
  const normalized = normalizeItems(items, config, defaultType);
  const rows = normalized.map((item) => buildRow(item, config));
  const validations = rows.map((row, index) => validateRow(row, normalized[index], config));
  const csvRoundtrip = validateCsvRoundtrip(rows);

  const readyCount = validations.filter((result) => result.rank_math_ready).length;
  const averageScore =
    validations.length > 0
      ? Math.round(validations.reduce((sum, result) => sum + result.estimated_rank_math_readiness_score, 0) / validations.length)
      : 0;

  const result: PipelineRunResult = {
    rows,
    validations,
    csv_roundtrip: csvRoundtrip,
    blocking_errors: [],
    summary: {
      total: rows.length,
      ready_count: readyCount,
      average_score: averageScore,
      score_formula: "(passed_rules / total_rules) * 100. Ready threshold: >= 70."
    }
  };
  result.blocking_errors = collectBlockingErrors(result);
  return result;
};

export const runPipeline = async (
  items: RawInputItem[],
  config: PipelineConfig,
  outputCsvPath: string,
  defaultType: ContentType,
  options?: {
    validationJsonPath?: string;
    summaryPath?: string;
    previewDir?: string;
  }
): Promise<PipelineRunResult> => {
  const result = evaluatePipeline(items, config, defaultType);

  if (result.blocking_errors.length) {
    throw new Error(
      `Validation failed before export:\n${result.blocking_errors.slice(0, 20).map((entry) => `- ${entry}`).join("\n")}`
    );
  }

  await mkdir(dirname(outputCsvPath), { recursive: true });
  await writeCsv(result.rows, outputCsvPath);

  if (options?.previewDir) {
    await mkdir(options.previewDir, { recursive: true });
    await Promise.all(
      result.rows.map((row, index) => {
        const filePath = join(options.previewDir!, `${String(index + 1).padStart(2, "0")}-${row.post_name}.html`);
        return writeFile(filePath, row.post_content, "utf8");
      })
    );
  }

  if (options?.validationJsonPath) {
    await mkdir(dirname(options.validationJsonPath), { recursive: true });
    await writeFile(options.validationJsonPath, JSON.stringify(result, null, 2), "utf8");
  }

  if (options?.summaryPath) {
    const lines = [
      `Total rows: ${result.summary.total}`,
      `Ready (>=70): ${result.summary.ready_count}`,
      `Average score: ${result.summary.average_score}`,
      `Scoring: ${result.summary.score_formula}`,
      `Blocking errors: ${result.blocking_errors.length}`,
      "",
      ...result.validations.map((entry) => {
        const failed = Object.entries(entry.rules)
          .filter(([, passed]) => !passed)
          .map(([rule]) => rule);
        return `${entry.post_title} | score=${entry.estimated_rank_math_readiness_score} | failed=${failed.join(",") || "none"}`;
      })
    ];

    await mkdir(dirname(options.summaryPath), { recursive: true });
    await writeFile(options.summaryPath, lines.join("\n"), "utf8");
  }

  return result;
};
