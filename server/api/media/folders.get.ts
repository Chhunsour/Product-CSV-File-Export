import { defineEventHandler, getQuery } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { requireAuth } from "../../utils/auth";

type FolderRow = {
  folder: string | null;
  public_url: string | null;
  external_url: string | null;
  created_at: string;
};

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const supabase = serverSupabaseServiceRole(event);
  const query = getQuery(event);

  const kind = query.kind === "video" ? "video" : "image";
  const category = typeof query.category === "string" ? query.category : "all";

  let request = supabase
    .from("media_assets")
    .select("folder, public_url, external_url, created_at")
    .eq("kind", kind)
    .not("folder", "is", null);

  if (category !== "all") {
    request = request.eq("category", category);
  }

  const { data, error } = await request;
  if (error) {
    throw error;
  }

  const map = new Map<
    string,
    { name: string; count: number; coverUrl: string | null; coverDate: string | null }
  >();

  (data as FolderRow[] | null)?.forEach((row) => {
    const name = row.folder?.trim();
    if (!name) return;
    const current = map.get(name) ?? {
      name,
      count: 0,
      coverUrl: null,
      coverDate: null
    };
    current.count += 1;
    const url = row.public_url || row.external_url || null;
    if (url) {
      if (!current.coverDate || row.created_at < current.coverDate) {
        current.coverDate = row.created_at;
        current.coverUrl = url;
      }
    }
    map.set(name, current);
  });

  const items = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));

  return { items };
});
