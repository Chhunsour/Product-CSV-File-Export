import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { createError, defineEventHandler, readMultipartFormData } from "h3";
import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import { requireAuth } from "../../utils/auth";

const getField = (form: Array<any> | null, name: string) => {
  const entry = form?.find((part) => part.name === name);
  if (!entry || !("data" in entry)) return "";
  return entry.data.toString();
};

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);
  if (!form) {
    throw createError({ statusCode: 400, statusMessage: "Missing upload data." });
  }

  const file = form.find((part) => part.name === "file" && "data" in part);
  if (!file || !("data" in file)) {
    throw createError({ statusCode: 400, statusMessage: "Missing file." });
  }

  const path = getField(form, "path");
  if (!path) {
    throw createError({ statusCode: 400, statusMessage: "Missing storage path." });
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
    if (!ownerId) {
      ownerId = getField(form, "ownerId")?.trim() || null;
    }
    if (!ownerId) {
      throw createError({ statusCode: 401, statusMessage: "Auth session missing!" });
    }
  } else {
    const user = await requireAuth(event);
    ownerId = user.id;
  }

  if (!path.startsWith(`${ownerId}/`)) {
    throw createError({ statusCode: 403, statusMessage: "Invalid storage path." });
  }

  const buffer = Buffer.from(file.data);
  if (devBypass) {
    const uploadRoot = resolve(process.cwd(), ".data", "uploads");
    const target = resolve(uploadRoot, path);
    if (!target.startsWith(`${uploadRoot}${sep}`)) {
      throw createError({ statusCode: 403, statusMessage: "Invalid storage path." });
    }
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, buffer);
    return { ok: true, path };
  }

  const supabase = serverSupabaseServiceRole(event);
  const { error } = await supabase.storage
    .from("workspace")
    .upload(path, buffer, { contentType: file.type || undefined, upsert: false });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { ok: true, path };
});
