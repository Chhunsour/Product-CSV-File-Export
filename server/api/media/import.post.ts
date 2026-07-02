import { createHash } from "node:crypto";
import { createError, defineEventHandler, readBody } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { useRuntimeConfig } from "#imports";
import { requireAuth } from "../../utils/auth";
import { buildMediaPath, buildVariantPath, normalizeExtension } from "../../utils/media/naming";
import { buildShortUrl, generateShortCode } from "../../utils/media/shortlink";
import { buildPublicUrl } from "../../utils/media/storage";
import { inferCategory, normalizeCategory } from "../../utils/media/categories";
import { createResizedWebp, createWebpBuffer, readImageMeta } from "../../utils/media/transforms";
import { slugify } from "~/utils/slug";

type ImportMode = "linked" | "stored";

const parseUrls = (value?: string | null) => {
  if (!value) return [];
  return value
    .split(/[,|\n]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const fileNameFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    return parts[parts.length - 1] || "media";
  } catch {
    const parts = url.split("/");
    return parts[parts.length - 1] || "media";
  }
};

const hashString = (value: string) => {
  return createHash("sha256").update(value).digest("hex");
};

const downloadRemote = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "";
  return { buffer, contentType };
};

const resolveProductId = (item: any) => {
  return item?.sku || item?.post_id || item?.id || null;
};

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const supabase = serverSupabaseServiceRole(event);
  const config = useRuntimeConfig(event);
  const body = await readBody<{
    kind?: "image" | "video";
    productId?: string;
    assetIds?: string[];
    mode?: ImportMode;
  }>(event);

  const kind = body?.kind === "video" ? "video" : "image";
  const mode: ImportMode = body?.mode === "stored" ? "stored" : "linked";
  const assetIds = body?.assetIds ?? [];
  const productId = body?.productId ?? "";

  if (!productId && !assetIds.length) {
    throw createError({ statusCode: 400, statusMessage: "Missing import target." });
  }

  let product: any = null;
  if (productId) {
    const { data, error } = await supabase
      .from("workspace_items")
      .select("id, title, slug, sku, post_id, categories, images, product_type")
      .eq("id", productId)
      .single();
    if (error) {
      throw error;
    }
    product = data;
  }

  const productSlug = product?.slug || slugify(product?.title || "product");
  const productKey = resolveProductId(product);
  const category = inferCategory([product?.categories]);

  const bucket = "media";
  let created = 0;
  let updated = 0;
  let skipped = 0;

  const ingestStored = async (url: string, label?: string | null, targetAssetId?: string) => {
    const { buffer, contentType } = await downloadRemote(url);
    const extFromUrl = fileNameFromUrl(url).split(".").pop() || "";
    const ext = normalizeExtension(extFromUrl || contentType.split("/")[1] || "bin");
    const hash = createHash("sha256").update(buffer).digest("hex");
    const naming = buildMediaPath({
      kind,
      productSlug,
      category,
      label: label || fileNameFromUrl(url),
      view: "",
      keySpec: "",
      ext
    });
    const storagePath = naming.storagePath;
    const publicUrl = buildPublicUrl(config.public.supabase.url, bucket, storagePath);
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, { contentType: contentType || undefined, upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const shortCode = generateShortCode();
    const shortUrl = buildShortUrl(config.public.siteBaseUrl, shortCode);
    const meta = kind === "image" ? await readImageMeta(buffer) : { width: null, height: null };

    let assetId = targetAssetId;
    if (targetAssetId) {
      const { error: updateError } = await supabase
        .from("media_assets")
        .update({
          kind,
          source: "stored",
          category: category || null,
          label: label || fileNameFromUrl(url),
          product_id: productKey,
          product_slug: productSlug,
          storage_bucket: bucket,
          storage_path: storagePath,
          external_url: url,
          public_url: publicUrl,
          source_hash: hash,
          mime_type: contentType || (kind === "image" ? `image/${ext}` : "application/octet-stream"),
          ext,
          bytes: buffer.length,
          width: meta.width,
          height: meta.height,
          alt: label || product?.title || null,
          title: label || product?.title || null,
          is_webp: kind === "image"
        })
        .eq("id", targetAssetId);

      if (updateError) {
        throw updateError;
      }

      await supabase.from("media_variants").delete().eq("asset_id", targetAssetId);
    } else {
      const { data: asset, error: insertError } = await supabase
        .from("media_assets")
        .insert({
          kind,
          source: "stored",
          category: category || null,
          label: label || fileNameFromUrl(url),
          product_id: productKey,
          product_slug: productSlug,
          storage_bucket: bucket,
          storage_path: storagePath,
          external_url: url,
          public_url: publicUrl,
          short_code: shortCode,
          short_url: shortUrl,
          source_hash: hash,
          mime_type: contentType || (kind === "image" ? `image/${ext}` : "application/octet-stream"),
          ext,
          bytes: buffer.length,
          width: meta.width,
          height: meta.height,
          alt: label || product?.title || null,
          title: label || product?.title || null,
          is_webp: kind === "image"
        })
        .select("*")
        .single();

      if (insertError) {
        throw insertError;
      }

      assetId = asset?.id;
    }

    if (!assetId) {
      return;
    }

    if (kind === "image") {
      const variantDefs = [
        { variant: "thumb", width: 320 },
        { variant: "small", width: 640 },
        { variant: "medium", width: 1200 }
      ] as const;
      const variantRows: Array<any> = [];

      for (const def of variantDefs) {
        const resized = await createResizedWebp(buffer, def.width);
        const variantPath = buildVariantPath(storagePath, def.variant, "webp");
        const { error } = await supabase.storage
          .from(bucket)
          .upload(variantPath, resized, { contentType: "image/webp", upsert: true });
        if (!error) {
          const metaResized = await readImageMeta(resized);
          variantRows.push({
            asset_id: assetId,
            variant: def.variant,
            storage_path: variantPath,
            public_url: buildPublicUrl(config.public.supabase.url, bucket, variantPath),
            width: metaResized.width,
            height: metaResized.height,
            bytes: resized.length
          });
        }
      }

      const webpBuffer = await createWebpBuffer(buffer);
      const webpPath = buildVariantPath(storagePath, "webp", "webp");
      const { error } = await supabase.storage
        .from(bucket)
        .upload(webpPath, webpBuffer, { contentType: "image/webp", upsert: true });
      if (!error) {
        const metaWebp = await readImageMeta(webpBuffer);
        variantRows.push({
          asset_id: assetId,
          variant: "webp",
          storage_path: webpPath,
          public_url: buildPublicUrl(config.public.supabase.url, bucket, webpPath),
          width: metaWebp.width,
          height: metaWebp.height,
          bytes: webpBuffer.length
        });
      }

      if (variantRows.length) {
        await supabase.from("media_variants").insert(variantRows);
      }
    }
  };

  if (assetIds.length) {
    if (product) {
      await supabase
        .from("media_assets")
        .update({
          product_id: productKey,
          product_slug: productSlug,
          category: normalizeCategory(category) || null
        })
        .in("id", assetIds);
    }

    if (mode === "stored") {
      const { data: assets, error } = await supabase
        .from("media_assets")
        .select("*")
        .in("id", assetIds);
      if (error) throw error;

      for (const asset of assets ?? []) {
        if (asset.source === "stored" || !asset.external_url) {
          skipped += 1;
          continue;
        }
        await ingestStored(asset.external_url, asset.label || undefined, asset.id);
        updated += 1;
      }
    }

    return { created, updated, skipped };
  }

  if (!product) {
    throw createError({ statusCode: 400, statusMessage: "Missing product for import." });
  }

  const urls = parseUrls(product?.images);
  if (!urls.length) {
    return { created, updated, skipped };
  }

  for (const url of urls) {
    const sourceHash = hashString(url);
    const { count } = await supabase
      .from("media_assets")
      .select("id", { count: "exact", head: true })
      .eq("source_hash", sourceHash);

    if ((count ?? 0) > 0) {
      skipped += 1;
      continue;
    }

    if (mode === "linked") {
      const ext = normalizeExtension(fileNameFromUrl(url).split(".").pop() || "jpg");
      const shortCode = generateShortCode();
      const shortUrl = buildShortUrl(config.public.siteBaseUrl, shortCode);

      const { error } = await supabase.from("media_assets").insert({
        kind,
        source: "linked",
        category: category || null,
        label: fileNameFromUrl(url),
        product_id: productKey,
        product_slug: productSlug,
        external_url: url,
        public_url: url,
        short_code: shortCode,
        short_url: shortUrl,
        source_hash: sourceHash,
        mime_type: kind === "image" ? `image/${ext}` : "application/octet-stream",
        ext,
        bytes: 0,
        alt: product?.title || null,
        title: product?.title || null
      });

      if (error) {
        throw error;
      }
      created += 1;
    } else {
      await ingestStored(url, fileNameFromUrl(url));
      created += 1;
    }
  }

  return { created, updated, skipped };
});
