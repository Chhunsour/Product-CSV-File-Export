import { createError, defineEventHandler, readBody } from "h3";
import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { requireAuth } from "../../utils/auth";
import { slugify } from "~/utils/slug";
import { shouldUseDemoFallback } from "../../utils/demoFallback";
import { updateDemoItem } from "../../utils/demoWorkspaceStore";

type UpdateBody = Record<string, any> & { id?: string; title?: string; ownerId?: string };

const textOrNull = (value: string | null | undefined) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as UpdateBody;
  const id = body?.id?.trim();
  const title = body?.title?.trim();
  if (!id || !title) {
    throw createError({ statusCode: 400, statusMessage: "Missing item id or title." });
  }

  const devPublic = process.env.DEV_PUBLIC_MEDIA === "true";
  const devBypass = process.env.DEV_BYPASS_AUTH === "true";
  let ownerId: string | null = null;
  if (devPublic || devBypass) {
    try {
      const user = await serverSupabaseUser(event);
      ownerId = user?.id ?? null;
    } catch {
      ownerId = null;
    }
    if (!ownerId && devBypass && process.env.DEV_OWNER_ID) {
      ownerId = process.env.DEV_OWNER_ID;
    }
    if (!ownerId && body?.ownerId?.trim()) {
      ownerId = body.ownerId.trim();
    }
    if (!ownerId) {
      throw createError({ statusCode: 401, statusMessage: "Auth session missing!" });
    }
  } else {
    const user = await requireAuth(event);
    ownerId = user.id;
  }

  const supabase = serverSupabaseServiceRole(event);
  const baseSlug = slugify(title);
  let candidate = baseSlug;
  let counter = 2;
  while (true) {
    const { count, error } = await supabase
      .from("workspace_items")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .eq("slug", candidate)
      .neq("id", id);
    if (error) {
      if (devBypass && ownerId && shouldUseDemoFallback(error)) {
        const item = await updateDemoItem(ownerId, body);
        if (!item) {
          throw createError({ statusCode: 404, statusMessage: "Item not found." });
        }
        return { item };
      }
      throw error;
    }
    if ((count ?? 0) === 0) {
      break;
    }
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const { data, error } = await supabase
    .from("workspace_items")
    .update({
      title,
      slug: candidate,
      excerpt: textOrNull(body.excerpt),
      content_md: textOrNull(body.content_md),
      status: body.status,
      featured: body.featured ?? false,
      folder: textOrNull(body.folder) ?? "production",
      parent_id: body.parent_id ?? null,
      post_id: textOrNull(body.post_id),
      post_password: textOrNull(body.post_password),
      menu_order: textOrNull(body.menu_order),
      post_date: textOrNull(body.post_date),
      post_author: textOrNull(body.post_author),
      comment_status: textOrNull(body.comment_status),
      sku: textOrNull(body.sku),
      gtin: textOrNull(body.gtin),
      parent_sku: textOrNull(body.parent_sku),
      children: textOrNull(body.children),
      downloadable: body.downloadable ?? false,
      virtual: body.virtual ?? false,
      stock: textOrNull(body.stock),
      regular_price: textOrNull(body.regular_price),
      sale_price: textOrNull(body.sale_price),
      weight: textOrNull(body.weight),
      length: textOrNull(body.length),
      width: textOrNull(body.width),
      height: textOrNull(body.height),
      tax_class: textOrNull(body.tax_class),
      stock_status: textOrNull(body.stock_status),
      backorders: textOrNull(body.backorders),
      sold_individually: body.sold_individually ?? false,
      low_stock_amount: textOrNull(body.low_stock_amount),
      manage_stock: body.manage_stock ?? false,
      tax_status: textOrNull(body.tax_status),
      upsell_ids: textOrNull(body.upsell_ids),
      crosssell_ids: textOrNull(body.crosssell_ids),
      purchase_note: textOrNull(body.purchase_note),
      sale_price_dates_from: textOrNull(body.sale_price_dates_from),
      sale_price_dates_to: textOrNull(body.sale_price_dates_to),
      download_limit: textOrNull(body.download_limit),
      download_expiry: textOrNull(body.download_expiry),
      product_url: textOrNull(body.product_url),
      button_text: textOrNull(body.button_text),
      product_type: textOrNull(body.product_type),
      categories: textOrNull(body.categories),
      tags: textOrNull(body.tags),
      images: textOrNull(body.images),
      short_description: textOrNull(body.short_description),
      shipping_class: textOrNull(body.shipping_class),
      visibility: textOrNull(body.visibility),
      attr_1_name: textOrNull(body.attr_1_name),
      attr_1_values: textOrNull(body.attr_1_values),
      attr_1_visible: body.attr_1_visible ?? false,
      attr_1_global: body.attr_1_global ?? false,
      attr_1_default: textOrNull(body.attr_1_default),
      attr_2_name: textOrNull(body.attr_2_name),
      attr_2_values: textOrNull(body.attr_2_values),
      attr_2_visible: body.attr_2_visible ?? false,
      attr_2_global: body.attr_2_global ?? false,
      attr_2_default: textOrNull(body.attr_2_default),
      attr_3_name: textOrNull(body.attr_3_name),
      attr_3_values: textOrNull(body.attr_3_values),
      attr_3_visible: body.attr_3_visible ?? false,
      attr_3_global: body.attr_3_global ?? false,
      attr_3_default: textOrNull(body.attr_3_default),
      download_1_name: textOrNull(body.download_1_name),
      download_1_url: textOrNull(body.download_1_url),
      download_2_name: textOrNull(body.download_2_name),
      download_2_url: textOrNull(body.download_2_url),
      rank_math_title: textOrNull(body.rank_math_title),
      rank_math_description: textOrNull(body.rank_math_description),
      rank_math_facebook_title: textOrNull(body.rank_math_facebook_title),
      rank_math_facebook_description: textOrNull(body.rank_math_facebook_description),
      rank_math_facebook_image: textOrNull(body.rank_math_facebook_image),
      rank_math_twitter_title: textOrNull(body.rank_math_twitter_title),
      rank_math_twitter_description: textOrNull(body.rank_math_twitter_description),
      rank_math_twitter_image: textOrNull(body.rank_math_twitter_image),
      rank_math_focus_keyword: textOrNull(body.rank_math_focus_keyword),
      rank_math_canonical_url: textOrNull(body.rank_math_canonical_url)
    })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("*")
    .single();

  if (error) {
    if (devBypass && ownerId && shouldUseDemoFallback(error)) {
      const item = await updateDemoItem(ownerId, body);
      if (!item) {
        throw createError({ statusCode: 404, statusMessage: "Item not found." });
      }
      return { item };
    }
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { item: data };
});
