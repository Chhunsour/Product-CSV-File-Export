import { createError, defineEventHandler, getQuery } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { requireAuth } from "../../utils/auth";
import { shouldUseDemoFallback } from "../../utils/demoFallback";
import { listDemoFolders } from "../../utils/demoWorkspaceStore";

export default defineEventHandler(async (event) => {
  const devPublic = process.env.DEV_PUBLIC_MEDIA === "true";
  const devBypass = process.env.DEV_BYPASS_AUTH === "true";
  const supabase = serverSupabaseServiceRole(event);

  let ownerId: string | null = null;
  if (!devPublic && !devBypass) {
    const user = await requireAuth(event);
    ownerId = user.id;
  } else {
    const query = getQuery(event);
    if (devBypass && process.env.DEV_OWNER_ID) {
      ownerId = process.env.DEV_OWNER_ID;
    }
    if (!ownerId && typeof query.ownerId === "string" && query.ownerId.trim()) {
      ownerId = query.ownerId.trim();
    }
  }

  let request = supabase
    .from("workspace_folders")
    .select("name,is_active,owner_id")
    .order("created_at", { ascending: true });

  if (ownerId) {
    request = request.eq("owner_id", ownerId);
  }

  const { data, error } = await request;
  if (error) {
    if (devBypass && ownerId && shouldUseDemoFallback(error)) {
      const items = await listDemoFolders(ownerId);
      return { items };
    }
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { items: data ?? [] };
});
