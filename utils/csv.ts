type CsvRow = Record<string, string | number | boolean | null | undefined>;

const escapeCsv = (value: string | number | boolean | null | undefined) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }
  return stringValue;
};

export const toCsv = (columns: string[], rows: CsvRow[]) => {
  const header = columns.map(escapeCsv).join(",");
  const body = rows
    .map((row) => columns.map((column) => escapeCsv(row[column])).join(","))
    .join("\n");
  return `${header}\n${body}`;
};

export const parseCsv = (input: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushRow = () => {
    if (row.length === 0 && cell.length === 0) return;
    row.push(cell);
    const hasContent = row.some((value) => value.trim().length > 0);
    if (hasContent) {
      rows.push(row);
    }
    row = [];
    cell = "";
  };

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (char === "\"") {
      if (inQuotes && input[i + 1] === "\"") {
        cell += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && input[i + 1] === "\n") {
        i += 1;
      }
      pushRow();
      continue;
    }

    cell += char;
  }

  if (cell.length || row.length) {
    pushRow();
  }

  if (!rows.length) {
    return { headers: [] as string[], rows: [] as string[][] };
  }

  const headers = rows.shift() ?? [];
  if (headers.length) {
    headers[0] = headers[0].replace(/^\uFEFF/, "");
  }
  return { headers, rows };
};

export const downloadCsv = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
