import { createError } from "h3";
import { serverSupabaseUser } from "#supabase/server";

export const requireAuth = async (event: any) => {
  const devBypass = process.env.DEV_BYPASS_AUTH === "true";
  if (devBypass) {
    return { id: process.env.DEV_OWNER_ID || "dev-public" } as any;
  }
  const devPublic = process.env.DEV_PUBLIC_MEDIA === "true";
  if (devPublic && (event.path?.startsWith("/api/media/") || event.node?.req?.url?.startsWith("/api/media/"))) {
    return { id: "dev-public" } as any;
  }
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  return user;
};
