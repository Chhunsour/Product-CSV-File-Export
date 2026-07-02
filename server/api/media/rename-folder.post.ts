import { defineEventHandler, readBody } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  await requireAuth(event);
  const supabase = serverSupabaseServiceRole(event);
  const body = await readBody<{
    kind?: string;
    category?: string;
    fromFolder?: string;
    toFolder?: string;
  }>(event);

  const kind = body?.kind === "video" ? "video" : "image";
  const fromFolder = body?.fromFolder?.trim();
  const toFolder = body?.toFolder?.trim();
  const category = body?.category && body.category !== "all" ? body.category : "";

  if (!fromFolder || !toFolder) {
    return { updated: 0 };
  }

  let request = supabase
    .from("media_assets")
    .update({ folder: toFolder })
    .eq("kind", kind)
    .eq("folder", fromFolder);

  if (category) {
    request = request.eq("category", category);
  }

  const { error, count } = await request;
  if (error) {
    throw error;
  }

  return { updated: count ?? 0 };
});
