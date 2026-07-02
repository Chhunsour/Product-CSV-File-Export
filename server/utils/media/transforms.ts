import sharp from "sharp";

export type ImageMeta = {
  width: number | null;
  height: number | null;
  format: string | null;
};

export const readImageMeta = async (buffer: Buffer): Promise<ImageMeta> => {
  const meta = await sharp(buffer).rotate().metadata();
  return {
    width: meta.width ?? null,
    height: meta.height ?? null,
    format: meta.format ?? null
  };
};

export const createWebpBuffer = async (buffer: Buffer, quality = 82) => {
  return sharp(buffer).rotate().webp({ quality }).toBuffer();
};

export const createResizedWebp = async (
  buffer: Buffer,
  width: number,
  quality = 80
) => {
  return sharp(buffer)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
};

export const createResized = async (
  buffer: Buffer,
  width: number,
  format: "jpeg" | "png" | "webp" = "webp",
  quality = 82
) => {
  let pipeline = sharp(buffer).rotate().resize({ width, withoutEnlargement: true });
  if (format === "jpeg") {
    pipeline = pipeline.jpeg({ quality });
  } else if (format === "png") {
    pipeline = pipeline.png({ quality });
  } else {
    pipeline = pipeline.webp({ quality });
  }
  return pipeline.toBuffer();
};
