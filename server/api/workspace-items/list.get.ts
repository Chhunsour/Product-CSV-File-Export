import { createError, defineEventHandler, getQuery } from "h3";
import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { requireAuth } from "../../utils/auth";
import { shouldUseDemoFallback } from "../../utils/demoFallback";
import { listDemoItems } from "../../utils/demoWorkspaceStore";

export default defineEventHandler(async (event) => {
  const devPublic = process.env.DEV_PUBLIC_MEDIA === "true";
  const devBypass = process.env.DEV_BYPASS_AUTH === "true";
  const supabase = serverSupabaseServiceRole(event);
  const query = getQuery(event);

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
    if (!ownerId && typeof query.ownerId === "string" && query.ownerId.trim()) {
      ownerId = query.ownerId.trim();
    }
  } else {
    const user = await requireAuth(event);
    ownerId = user.id;
  }

  const term = typeof query.q === "string" ? query.q.trim() : "";

  let request = supabase
    .from("workspace_items")
    .select("*")
    .order("updated_at", { ascending: false });

  if (ownerId) {
    request = request.eq("owner_id", ownerId);
  }

  if (term) {
    const pattern = `%${term}%`;
    request = request.or(
      [
        `title.ilike.${pattern}`,
        `post_id.ilike.${pattern}`,
        `sku.ilike.${pattern}`,
        `slug.ilike.${pattern}`,
        `excerpt.ilike.${pattern}`,
        `short_description.ilike.${pattern}`,
        `regular_price.ilike.${pattern}`,
        `sale_price.ilike.${pattern}`,
        `categories.ilike.${pattern}`,
        `tags.ilike.${pattern}`,
        `product_type.ilike.${pattern}`
      ].join(",")
    );
  }

  const { data, error } = await request;
  if (error) {
    if (devBypass && ownerId && shouldUseDemoFallback(error)) {
      const items = await listDemoItems(ownerId, term);
      return { items };
    }
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { items: data ?? [] };
});
