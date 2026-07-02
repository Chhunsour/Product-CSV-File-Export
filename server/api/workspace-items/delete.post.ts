import { createError, defineEventHandler, readBody } from "h3";
import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { requireAuth } from "../../utils/auth";
import { shouldUseDemoFallback } from "../../utils/demoFallback";
import { deleteDemoItems } from "../../utils/demoWorkspaceStore";

type DeleteBody = {
  id?: string;
  ids?: string[];
  ownerId?: string;
};

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as DeleteBody;
  const ids = body?.ids?.length ? body.ids : body?.id ? [body.id] : [];
  if (!ids.length) {
    throw createError({ statusCode: 400, statusMessage: "Missing item id." });
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
  const { error } = await supabase
    .from("workspace_items")
    .delete()
    .in("id", ids)
    .eq("owner_id", ownerId);

  if (error) {
    if (devBypass && ownerId && shouldUseDemoFallback(error)) {
      await deleteDemoItems(ownerId, ids);
      return { ok: true };
    }
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { ok: true };
});
