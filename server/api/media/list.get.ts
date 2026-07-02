import { defineEventHandler, getQuery, setHeader } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { requireAuth } from "../../utils/auth";

type SortKey = "newest" | "oldest" | "name" | "size";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const supabase = serverSupabaseServiceRole(event);
  const query = getQuery(event);

  const kind = query.kind === "video" ? "video" : "image";
  const source = typeof query.source === "string" ? query.source : "all";
  const format = typeof query.format === "string" ? query.format : "all";
  const category = typeof query.category === "string" ? query.category : "all";
  const folderRaw = query.folder;
  const folderInput =
    typeof folderRaw === "string"
      ? folderRaw
      : Array.isArray(folderRaw)
        ? folderRaw.join(",")
        : "all";
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const sort = (typeof query.sort === "string" ? query.sort : "newest") as SortKey;
  const limit = Math.min(Number(query.limit) || 60, 200);
  const offset = Math.max(Number(query.offset) || 0, 0);

  let request = supabase
    .from("media_assets")
    .select("*, media_variants (*)", { count: "exact" })
    .eq("kind", kind);

  if (source !== "all") {
    request = request.eq("source", source);
  }

  if (category !== "all") {
    request = request.eq("category", category);
  }

  const folderValues = folderInput
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (folderValues.length && !folderValues.includes("all")) {
    if (folderValues.length === 1) {
      request = request.eq("folder", folderValues[0]);
    } else {
      request = request.in("folder", folderValues);
    }
  }

  if (format !== "all") {
    if (format === "webp") {
      request = request.eq("is_webp", true);
    } else {
      request = request.eq("ext", format);
    }
  }

  if (search) {
    const pattern = `%${search}%`;
    request = request.or(
      [
        `label.ilike.${pattern}`,
        `product_slug.ilike.${pattern}`,
        `alt.ilike.${pattern}`,
        `title.ilike.${pattern}`,
        `external_url.ilike.${pattern}`
      ].join(",")
    );
  }

  if (sort === "oldest") {
    request = request.order("created_at", { ascending: true });
  } else if (sort === "name") {
    request = request.order("label", { ascending: true, nullsFirst: false });
  } else if (sort === "size") {
    request = request.order("bytes", { ascending: false });
  } else {
    request = request.order("created_at", { ascending: false });
  }

  request = request.range(offset, offset + limit - 1);

  const { data, error, count } = await request;
  if (error) {
    throw error;
  }

  setHeader(event, "Cache-Control", "private, max-age=30");

  return {
    items: data ?? [],
    total: count ?? 0,
    offset,
    limit
  };
});
