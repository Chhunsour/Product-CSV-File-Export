import { defineEventHandler, getQuery, setHeader } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const supabase = serverSupabaseServiceRole(event);
  const query = getQuery(event);
  const kind = query.kind === "video" ? "video" : "image";

  const { data, error } = await supabase
    .from("media_assets")
    .select("id, source, is_webp, product_id, product_slug, ext, category, updated_at")
    .eq("kind", kind);

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const formatCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  let stored = 0;
  let linked = 0;
  let webp = 0;
  let latest: string | null = null;
  const productSet = new Set<string>();

  for (const row of rows) {
    if (row.source === "stored") stored += 1;
    if (row.source === "linked") linked += 1;
    if (row.is_webp) webp += 1;

    if (row.ext) {
      formatCounts[row.ext] = (formatCounts[row.ext] ?? 0) + 1;
    }
    if (row.category) {
      categoryCounts[row.category] = (categoryCounts[row.category] ?? 0) + 1;
    }

    const productKey = row.product_id || row.product_slug;
    if (productKey) {
      productSet.add(productKey);
    }

    if (row.updated_at) {
      if (!latest || new Date(row.updated_at).getTime() > new Date(latest).getTime()) {
        latest = row.updated_at;
      }
    }
  }

  setHeader(event, "Cache-Control", "private, max-age=30");

  return {
    total: rows.length,
    stored,
    linked,
    items: productSet.size,
    webp,
    updatedAt: latest,
    formatCounts,
    categoryCounts
  };
});
