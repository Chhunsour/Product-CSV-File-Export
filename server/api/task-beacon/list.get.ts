import { createError, defineEventHandler, getQuery } from "h3";
import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const devPublic = process.env.DEV_PUBLIC_MEDIA === "true";
  const devBypass = process.env.DEV_BYPASS_AUTH === "true";
  const query = getQuery(event);

  let ownerId: string | null = null;
  if (devPublic || devBypass) {
    try {
      const user = await serverSupabaseUser(event);
      ownerId = user?.id ?? null;
    } catch {
      ownerId = null;
    }
    if (!ownerId && process.env.DEV_OWNER_ID && devBypass) {
      ownerId = process.env.DEV_OWNER_ID;
    }
    if (!ownerId && typeof query.ownerId === "string" && query.ownerId.trim()) {
      ownerId = query.ownerId.trim();
    }
    if (!ownerId) {
      throw createError({ statusCode: 401, statusMessage: "Auth session missing!" });
    }
  } else {
    const user = await requireAuth(event);
    ownerId = user.id;
  }

  const supabase = serverSupabaseServiceRole(event);
  const { data, error } = await supabase
    .from("task_beacon")
    .select("data")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  const items = Array.isArray(data?.data) ? data?.data : [];
  return { items };
});
