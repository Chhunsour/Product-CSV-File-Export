import { defineEventHandler, readBody } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const supabase = serverSupabaseServiceRole(event);
  const body = await readBody<{ ids?: string[] }>(event);
  const ids = body?.ids ?? [];

  if (!ids.length) {
    return { deleted: 0 };
  }

  const { data: assets, error } = await supabase
    .from("media_assets")
    .select("id, source, storage_bucket, storage_path, media_variants (storage_path)")
    .in("id", ids);

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

  const { error: deleteError } = await supabase.from("media_assets").delete().in("id", ids);
  if (deleteError) {
    throw deleteError;
  }

  return { deleted: ids.length };
});
