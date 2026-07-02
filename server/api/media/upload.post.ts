import { createHash } from "node:crypto";
import { createError, defineEventHandler, readMultipartFormData } from "h3";
import { useRuntimeConfig } from "#imports";
import { serverSupabaseServiceRole } from "#supabase/server";
import { requireAuth } from "../../utils/auth";
import { buildMediaPath, buildVariantPath, normalizeExtension } from "../../utils/media/naming";
import { buildShortUrl, generateShortCode } from "../../utils/media/shortlink";
import { buildPublicUrl } from "../../utils/media/storage";
import { normalizeCategory } from "../../utils/media/categories";
import { createResizedWebp, createWebpBuffer, readImageMeta } from "../../utils/media/transforms";

const getField = (form: Array<any> | null, name: string) => {
  const entry = form?.find((part) => part.name === name);
  if (!entry || !("data" in entry)) return "";
  return entry.data.toString();
};

const parseBoolean = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "on" || normalized === "yes";
};

const suggestAlt = (options: {
  productSlug?: string | null;
  label?: string | null;
  view?: string | null;
  keySpec?: string | null;
}) => {
  const base = options.productSlug
    ? options.productSlug.replace(/-/g, " ")
    : options.label || "Media";
  const view = options.view || "view";
  const keySpec = options.keySpec ? ` (${options.keySpec})` : "";
  return `${base} – ${view}${keySpec}`;
};

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const supabase = serverSupabaseServiceRole(event);
  const config = useRuntimeConfig(event);
  const form = await readMultipartFormData(event);

  if (!form) {
    throw createError({ statusCode: 400, statusMessage: "Missing upload data." });
  }

  const file = form.find((part) => part.name === "file" && "data" in part);
  if (!file || !("data" in file)) {
    throw createError({ statusCode: 400, statusMessage: "Missing file." });
  }

  const kind = getField(form, "kind") === "video" ? "video" : "image";
  const label = getField(form, "label") || file.filename || "";
  const productSlug = getField(form, "productSlug") || "";
  const productId = getField(form, "productId") || "";
  const category = normalizeCategory(getField(form, "category")) || "";
  const folder = getField(form, "folder") || "";
  const view = getField(form, "view") || "";
  const keySpec = getField(form, "keySpec") || "";
  const posterAssetId = getField(form, "posterAssetId") || "";
  const alt = getField(form, "alt") || "";
  const title = getField(form, "title") || "";
  const convertToWebp = parseBoolean(getField(form, "convertToWebp"));

  const extFromFile = file.filename?.split(".").pop() || "";
  const ext = normalizeExtension(extFromFile || file.type?.split("/")[1] || "bin");
  const mimeType = file.type || (kind === "image" ? `image/${ext}` : "application/octet-stream");
  const buffer = Buffer.from(file.data);
  const bytes = buffer.length;
  const hash = createHash("sha256").update(buffer).digest("hex");

  const { data: existingAsset, error: existingError } = await supabase
    .from("media_assets")
    .select("*")
    .eq("source_hash", hash)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existingAsset) {
    return { asset: existingAsset, existing: true };
  }

  const naming = buildMediaPath({
    kind,
    productSlug,
    category,
    folder,
    label,
    view,
    keySpec,
    ext
  });

  const bucket = "media";
  const storagePath = naming.storagePath;
  const publicUrl = buildPublicUrl(config.public.supabase.url, bucket, storagePath);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, buffer, { contentType: mimeType, upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const shortCode = generateShortCode();
  const shortUrl = buildShortUrl(config.public.siteBaseUrl, shortCode);

  const meta = kind === "image" ? await readImageMeta(buffer) : { width: null, height: null };
  const resolvedAlt = alt || suggestAlt({ productSlug, label, view, keySpec });

  const { data: asset, error: insertError } = await supabase
    .from("media_assets")
    .insert({
      kind,
      source: "stored",
      category: category || null,
      folder: folder || null,
      label: label || null,
      product_id: productId || null,
      product_slug: productSlug || null,
      storage_bucket: bucket,
      storage_path: storagePath,
      public_url: publicUrl,
      short_code: shortCode,
      short_url: shortUrl,
      source_hash: hash,
      mime_type: mimeType,
      ext,
      bytes,
      width: meta.width,
      height: meta.height,
      poster_asset_id: posterAssetId || null,
      alt: resolvedAlt,
      title: title || label || null,
      is_primary: false,
      is_webp: ext === "webp" || convertToWebp
    })
    .select("*")
    .single();

  if (insertError) {
    if ((insertError as any).code === "23505") {
      const { data: duplicateAsset } = await supabase
        .from("media_assets")
        .select("*")
        .eq("source_hash", hash)
        .maybeSingle();
      if (duplicateAsset) {
        return { asset: duplicateAsset, existing: true };
      }
    }
    throw insertError;
  }

  if (kind === "image") {
    const variantDefs = [
      { variant: "thumb", width: 320 },
      { variant: "small", width: 640 },
      { variant: "medium", width: 1200 }
    ] as const;

    const variantRows: Array<{
      asset_id: string;
      variant: string;
      storage_path: string;
      public_url: string;
      width: number | null;
      height: number | null;
      bytes: number;
    }> = [];

    for (const def of variantDefs) {
      const resized = await createResizedWebp(buffer, def.width);
      const variantPath = buildVariantPath(storagePath, def.variant, "webp");
      const { error } = await supabase.storage
        .from(bucket)
        .upload(variantPath, resized, { contentType: "image/webp", upsert: true });

      if (!error) {
        const metaResized = await readImageMeta(resized);
        variantRows.push({
          asset_id: asset.id,
          variant: def.variant,
          storage_path: variantPath,
          public_url: buildPublicUrl(config.public.supabase.url, bucket, variantPath),
          width: metaResized.width,
          height: metaResized.height,
          bytes: resized.length
        });
      }
    }

    if (convertToWebp && ext !== "webp") {
      const webpBuffer = await createWebpBuffer(buffer);
      const variantPath = buildVariantPath(storagePath, "webp", "webp");
      const { error } = await supabase.storage
        .from(bucket)
        .upload(variantPath, webpBuffer, { contentType: "image/webp", upsert: true });

      if (!error) {
        const metaWebp = await readImageMeta(webpBuffer);
        variantRows.push({
          asset_id: asset.id,
          variant: "webp",
          storage_path: variantPath,
          public_url: buildPublicUrl(config.public.supabase.url, bucket, variantPath),
          width: metaWebp.width,
          height: metaWebp.height,
          bytes: webpBuffer.length
        });
      }
    }

    if (variantRows.length) {
      const { error: variantError } = await supabase.from("media_variants").insert(variantRows);
      if (variantError) {
        throw variantError;
      }
    }
  }

  return { asset };
});
