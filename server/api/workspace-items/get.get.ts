import { createError, defineEventHandler, getQuery } from "h3";
import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { requireAuth } from "../../utils/auth";
import { shouldUseDemoFallback } from "../../utils/demoFallback";
import { getDemoItem } from "../../utils/demoWorkspaceStore";

export default defineEventHandler(async (event) => {
  const devPublic = process.env.DEV_PUBLIC_MEDIA === "true";
  const devBypass = process.env.DEV_BYPASS_AUTH === "true";
  const supabase = serverSupabaseServiceRole(event);
  const query = getQuery(event);

  const id = typeof query.id === "string" ? query.id.trim() : "";
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }

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

  let request = supabase.from("workspace_items").select("*").eq("id", id);
  if (ownerId) {
    request = request.eq("owner_id", ownerId);
  }

  const { data, error } = await request.maybeSingle();
  if (error) {
    if (devBypass && ownerId && shouldUseDemoFallback(error)) {
      const item = await getDemoItem(ownerId, id);
      return { item };
    }
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { item: data ?? null };
});
