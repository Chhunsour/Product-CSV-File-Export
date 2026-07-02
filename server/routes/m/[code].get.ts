import { createError, defineEventHandler, sendRedirect } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const code = event.context.params?.code;
  if (!code) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  const supabase = serverSupabaseServiceRole(event);
  const { data, error } = await supabase
    .from("media_assets")
    .select("public_url, external_url")
    .eq("short_code", code)
    .maybeSingle();

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  const target = data.public_url || data.external_url;
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  return sendRedirect(event, target, 301);
});
