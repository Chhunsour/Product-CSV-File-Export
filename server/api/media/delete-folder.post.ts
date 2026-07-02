import { defineEventHandler, readBody } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const supabase = serverSupabaseServiceRole(event);
  const body = await readBody<{ kind?: string; category?: string; folder?: string }>(event);

  const kind = body?.kind === "video" ? "video" : "image";
  const folder = body?.folder?.trim();
  const category = body?.category && body.category !== "all" ? body.category : "";

  if (!folder) {
    return { deleted: 0 };
  }

  let request = supabase
    .from("media_assets")
    .select("id, source, storage_bucket, storage_path, media_variants (storage_path)")
    .eq("kind", kind)
    .eq("folder", folder);

  if (category) {
    request = request.eq("category", category);
  }

  const { data: assets, error } = await request;
  if (error) {
    throw error;
  }

  for (const asset of assets ?? []) {
    if (asset.source !== "stored") continue;
    const bucket = asset.storage_bucket || "media";
    const paths = new Set<string>();
    if (asset.storage_path) paths.add(asset.storage_path);
    for (const variant of asset.media_variants ?? []) {
      if (variant?.storage_path) paths.add(variant.storage_path);
    }
    if (paths.size) {
      await supabase.storage.from(bucket).remove(Array.from(paths));
    }
  }

  let deleteRequest = supabase
    .from("media_assets")
    .delete({ count: "exact" })
    .eq("kind", kind)
    .eq("folder", folder);

  if (category) {
    deleteRequest = deleteRequest.eq("category", category);
  }

  const { error: deleteError, count } = await deleteRequest;
  if (deleteError) {
    throw deleteError;
  }

  return { deleted: count ?? assets?.length ?? 0 };
});
