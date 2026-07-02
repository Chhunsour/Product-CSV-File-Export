import { createError, defineEventHandler, readBody } from "h3";
import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { requireAuth } from "../../utils/auth";

type SaveBody = {
  items?: any[];
  ownerId?: string;
};

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as SaveBody;
  const items = Array.isArray(body?.items) ? body.items : [];

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
  const { error } = await supabase
    .from("task_beacon")
    .upsert({ owner_id: ownerId, data: items }, { onConflict: "owner_id" });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { ok: true };
});
