import { createError, defineEventHandler, readBody } from "h3";
import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { requireAuth } from "../../utils/auth";
import { shouldUseDemoFallback } from "../../utils/demoFallback";
import { deleteDemoFolder } from "../../utils/demoWorkspaceStore";

type DeleteBody = {
  name?: string;
  fallback?: string;
  ownerId?: string;
};

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as DeleteBody;
  const name = body?.name?.trim();
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "Missing folder name." });
  }
  const fallback = body?.fallback?.trim() || "production";

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
  const { error: moveError } = await supabase
    .from("workspace_items")
    .update({ folder: fallback })
    .eq("owner_id", ownerId)
    .eq("folder", name);

  if (moveError) {
    if (devBypass && ownerId && shouldUseDemoFallback(moveError)) {
      await deleteDemoFolder(ownerId, name, fallback);
      return { ok: true };
    }
    throw createError({ statusCode: 500, statusMessage: moveError.message });
  }

  const { error: deleteError } = await supabase
    .from("workspace_folders")
    .delete()
    .eq("owner_id", ownerId)
    .eq("name", name);

  if (deleteError) {
    if (devBypass && ownerId && shouldUseDemoFallback(deleteError)) {
      await deleteDemoFolder(ownerId, name, fallback);
      return { ok: true };
    }
    throw createError({ statusCode: 500, statusMessage: deleteError.message });
  }

  return { ok: true };
});
