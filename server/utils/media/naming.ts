import { randomBytes } from "node:crypto";
import { slugify } from "~/utils/slug";

export type MediaKind = "image" | "video";

const normalizeSlug = (value?: string | null, fallback = "media") => {
  const slug = slugify(value ?? "");
  return slug && slug !== "item" ? slug : fallback;
};

const resolveView = (value?: string | null, label?: string | null) => {
  const view = normalizeSlug(value ?? "", "");
  if (view) return view;
  const labelSlug = normalizeSlug(label ?? "", "view");
  return labelSlug.split("-")[0] || "view";
};

const resolveKeySpec = (value?: string | null, label?: string | null) => {
  const keySpec = normalizeSlug(value ?? "", "");
  if (keySpec) return keySpec;
  const labelSlug = normalizeSlug(label ?? "", "detail");
  return labelSlug;
};

const randomHash = () => randomBytes(4).toString("hex");

export const normalizeExtension = (value: string) => {
  const clean = value.replace(".", "").toLowerCase();
  if (clean === "jpeg") return "jpg";
  return clean || "bin";
};

export const buildMediaPath = (options: {
  kind: MediaKind;
  productSlug?: string | null;
  category?: string | null;
  folder?: string | null;
  label?: string | null;
  view?: string | null;
  keySpec?: string | null;
  ext: string;
}) => {
  const productSlug = normalizeSlug(options.productSlug ?? "", "");
  const categorySlug = normalizeSlug(options.category ?? "", "misc");
  const folderSlug = normalizeSlug(options.folder ?? "", "");
  const kindFolder = options.kind === "image" ? "images" : "videos";
  const view = resolveView(options.view, options.label);
  const keySpec = resolveKeySpec(options.keySpec, options.label);
  const hash = randomHash();
  const baseSlug = productSlug || categorySlug;
  const folder = productSlug
    ? `products/${productSlug}/${kindFolder}${folderSlug ? `/${folderSlug}` : ""}`
    : `categories/${categorySlug}/${folderSlug || "misc"}/${kindFolder}`;
  const fileBase = `${baseSlug}-${view}-${keySpec}-${hash}`;
  const fileName = `${fileBase}.${normalizeExtension(options.ext)}`;
  return {
    folder,
    fileBase,
    fileName,
    storagePath: `${folder}/${fileName}`
  };
};

export const buildVariantPath = (
  storagePath: string,
  variant: "thumb" | "small" | "medium" | "large" | "webp",
  ext = "webp"
) => {
  const normalizedExt = normalizeExtension(ext);
  const parts = storagePath.split("/");
  const fileName = parts.pop() || "asset";
  const base = fileName.replace(/\.[^/.]+$/, "");
  const variantName = `${base}-${variant}.${normalizedExt}`;
  return [...parts, variantName].join("/");
};
