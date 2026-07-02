import type { ProductImage } from "~/types/db";
import { parseImagesField } from "~/utils/parseImagesField";

export const joinImagesForWoo = (
  input: ProductImage[] | string | null | undefined,
  separator: "|" | "," = "|"
): string => {
  if (!input) return "";

  const signedUrlRegex = /(object\/sign|token=|X-Amz-Signature)/i;

  if (typeof input === "string") {
    return parseImagesField(input)
      .filter((url) => !signedUrlRegex.test(url))
      .join(separator);
  }

  const ordered = [...input].filter((item) => item.url?.trim());
  ordered.sort((a, b) => {
    const aPrimary = a.is_primary ? -1 : 0;
    const bPrimary = b.is_primary ? -1 : 0;
    if (aPrimary !== bPrimary) return aPrimary - bPrimary;
    const aSort = a.sort_order ?? 0;
    const bSort = b.sort_order ?? 0;
    return aSort - bSort;
  });

  return ordered
    .map((item) => item.url.trim())
    .filter((url) => !signedUrlRegex.test(url))
    .join(separator);
};
