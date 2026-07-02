import type { ProductImage } from "~/types/db";
import { joinImagesForWoo } from "~/utils/joinImagesForWoo";

export const formatImagesForWoo = (
  input: ProductImage[] | string | null | undefined,
  separator: "|" | "," = "|"
) => joinImagesForWoo(input, separator);
