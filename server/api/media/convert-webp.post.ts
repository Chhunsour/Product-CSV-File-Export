import { defineEventHandler, readBody } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { useRuntimeConfig } from "#imports";
import { requireAuth } from "../../utils/auth";
import { buildVariantPath } from "../../utils/media/naming";
import { buildPublicUrl } from "../../utils/media/storage";
import { createWebpBuffer, readImageMeta } from "../../utils/media/transforms";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const supabase = serverSupabaseServiceRole(event);
  const config = useRuntimeConfig(event);
  const body = await readBody<{ ids?: string[] }>(event);

  const ids = body?.ids ?? [];
  if (!ids.length) {
    return { updated: 0, skipped: 0 };
  }

  const { data: assets, error } = await supabase
    .from("media_assets")
    .select("*")
    .in("id", ids);

  if (error) {
    throw error;
  }

  let updated = 0;
  let skipped = 0;

  for (const asset of assets ?? []) {
    if (asset.kind !== "image" || asset.source !== "stored" || !asset.storage_path) {
      skipped += 1;
      continue;
    }

    const bucket = asset.storage_bucket || "media";
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(asset.storage_path);

    if (downloadError || !fileData) {
      skipped += 1;
      continue;
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const webpBuffer = await createWebpBuffer(buffer);
    const variantPath = buildVariantPath(asset.storage_path, "webp", "webp");

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(variantPath, webpBuffer, { contentType: "image/webp", upsert: true });

    if (uploadError) {
      skipped += 1;
      continue;
    }

    const meta = await readImageMeta(webpBuffer);

    await supabase.from("media_variants").upsert(
      {
        asset_id: asset.id,
        variant: "webp",
        storage_path: variantPath,
        public_url: buildPublicUrl(config.public.supabase.url, bucket, variantPath),
        width: meta.width,
        height: meta.height,
        bytes: webpBuffer.length
      },
      { onConflict: "storage_path" }
    );

    await supabase.from("media_assets").update({ is_webp: true }).eq("id", asset.id);
    updated += 1;
  }

  return { updated, skipped };
});
