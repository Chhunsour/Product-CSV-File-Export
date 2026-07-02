import { createError, defineEventHandler, readBody } from "h3";
import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { requireAuth } from "../../utils/auth";
import { shouldUseDemoFallback } from "../../utils/demoFallback";
import { ensureDemoFolder } from "../../utils/demoWorkspaceStore";

type EnsureBody = {
  name?: string;
  setActive?: boolean;
  ownerId?: string;
};

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as EnsureBody;
  const name = body?.name?.trim();

  if (!name) {
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

  if (body?.setActive) {
    await supabase
      .from("workspace_folders")
      .update({ is_active: false })
      .eq("owner_id", ownerId);
  }

  const { error } = await supabase
    .from("workspace_folders")
    .upsert(
      { owner_id: ownerId, name, is_active: Boolean(body?.setActive) },
      { onConflict: "owner_id,name" }
    );

  if (error) {
    if (devBypass && ownerId && shouldUseDemoFallback(error)) {
      await ensureDemoFolder(ownerId, name, Boolean(body?.setActive));
      return { ok: true };
    }
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { ok: true };
});
