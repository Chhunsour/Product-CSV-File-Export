import { dirname, extname, resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { ingestJson } from "./ingest/json";
import { ingestCsv } from "./ingest/csv";
import { ingestDocx } from "./ingest/docx";
import { loadConfig } from "./config";
import { evaluatePipeline, runPipeline } from "./index";
import type { ContentType, RawInputItem } from "./types";

type CliArgs = {
  command: "build" | "validate";
  input?: string;
  output?: string;
  type: ContentType;
  config?: string;
  report?: string;
  summary?: string;
  previewDir?: string;
  docx: string[];
};

const parseArgs = (argv: string[]): CliArgs => {
  const maybeCommand = argv[0];
  const command = maybeCommand === "validate" ? "validate" : "build";
  const offset = maybeCommand === "build" || maybeCommand === "validate" ? 1 : 0;
  const args: CliArgs = {
    command,
    type: "post",
    docx: []
  };

  for (let i = offset; i < argv.length; i += 1) {
    const flag = argv[i];
    const next = argv[i + 1];

    if (flag === "--input" && next) {
      args.input = next;
      i += 1;
      continue;
    }
    if (flag === "--output" && next) {
      args.output = next;
      i += 1;
      continue;
    }
    if (flag === "--type" && next && (next === "post" || next === "product")) {
      args.type = next;
      i += 1;
      continue;
    }
    if (flag === "--config" && next) {
      args.config = next;
      i += 1;
      continue;
    }
    if (flag === "--report" && next) {
      args.report = next;
      i += 1;
      continue;
    }
    if (flag === "--summary" && next) {
      args.summary = next;
      i += 1;
      continue;
    }
    if (flag === "--preview-dir" && next) {
      args.previewDir = next;
      i += 1;
      continue;
    }
    if (flag === "--docx" && next) {
      args.docx.push(...next.split(",").map((entry) => entry.trim()).filter(Boolean));
      i += 1;
      continue;
    }
  }

  return args;
};

const loadInput = async (inputPath: string): Promise<RawInputItem[]> => {
  const extension = extname(inputPath).toLowerCase();

  if (extension === ".json") {
    return ingestJson(inputPath);
  }

  if (extension === ".csv") {
    return ingestCsv(inputPath);
  }

  throw new Error(`Unsupported input extension: ${extension}. Use .json or .csv.`);
};

const printUsage = () => {
  console.log(
    [
      "Usage:",
      "node cli.js build --input input.json --output out.csv --type post|product --config config.json",
      "node cli.js validate --input input.json --type post|product --config config.json --report report.json",
      "Optional flags:",
      "  --docx file1.docx,file2.docx",
      "  --report out.validation.json",
      "  --summary out.summary.txt",
      "  --preview-dir ./previews"
    ].join("\n")
  );
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if ((!args.input && args.docx.length === 0) || (args.command === "build" && !args.output)) {
    printUsage();
    throw new Error("Missing required flags.");
  }

  const config = await loadConfig(args.config ? resolve(args.config) : undefined);

  const items: RawInputItem[] = [];
  if (args.input) {
    items.push(...(await loadInput(resolve(args.input))));
  }

  if (args.docx.length) {
    items.push(...(await ingestDocx(args.docx.map((path) => resolve(path)))));
  }

  if (!items.length) {
    throw new Error("No items found after ingestion.");
  }

  if (args.command === "validate") {
    const reportPath = resolve(args.report || "wp-csv-pipeline-report.json");
    const result = evaluatePipeline(items, config, args.type);
    await mkdir(dirname(reportPath), { recursive: true });
    await writeFile(reportPath, JSON.stringify(result, null, 2), "utf8");

    console.log(`Validation report: ${reportPath}`);
    if (result.blocking_errors.length) {
      console.error(`Blocking errors (${result.blocking_errors.length}):`);
      result.blocking_errors.slice(0, 20).forEach((entry) => console.error(`- ${entry}`));
      process.exit(1);
    }
    console.log("Validation passed: no import-blocking issues found.");
    return;
  }

  const output = resolve(args.output!);
  const reportPath = resolve(args.report || `${output}.validation.json`);
  const summaryPath = resolve(args.summary || `${output}.summary.txt`);

  const result = await runPipeline(items, config, output, args.type, {
    validationJsonPath: reportPath,
    summaryPath,
    previewDir: args.previewDir ? resolve(args.previewDir) : undefined
  });

  console.log(`CSV written: ${output}`);
  console.log(`Validation report: ${reportPath}`);
  console.log(`Summary: ${summaryPath}`);
  console.log(`Rank Math ready: ${result.summary.ready_count}/${result.summary.total} | avg score ${result.summary.average_score}`);
};

main().catch((error) => {
  console.error(`[wp-csv-pipeline] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
