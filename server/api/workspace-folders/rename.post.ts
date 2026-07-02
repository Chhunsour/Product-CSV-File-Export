import { createError, defineEventHandler, readBody } from "h3";
import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { requireAuth } from "../../utils/auth";
import { shouldUseDemoFallback } from "../../utils/demoFallback";
import { renameDemoFolder } from "../../utils/demoWorkspaceStore";

type RenameBody = {
  name?: string;
  next?: string;
  ownerId?: string;
};

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as RenameBody;
  const name = body?.name?.trim();
  const next = body?.next?.trim();
  if (!name || !next || name === next) {
    throw createError({ statusCode: 400, statusMessage: "Missing folder name." });
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

  const { error: moveError } = await supabase
    .from("workspace_items")
    .update({ folder: next })
    .eq("owner_id", ownerId)
    .eq("folder", name);

  if (moveError) {
    if (devBypass && ownerId && shouldUseDemoFallback(moveError)) {
      await renameDemoFolder(ownerId, name, next);
      return { ok: true };
    }
    throw createError({ statusCode: 500, statusMessage: moveError.message });
  }

  const { error: renameError } = await supabase
    .from("workspace_folders")
    .update({ name: next })
    .eq("owner_id", ownerId)
    .eq("name", name);

  if (renameError) {
    if (devBypass && ownerId && shouldUseDemoFallback(renameError)) {
      await renameDemoFolder(ownerId, name, next);
      return { ok: true };
    }
    throw createError({ statusCode: 500, statusMessage: renameError.message });
  }

  return { ok: true };
});
