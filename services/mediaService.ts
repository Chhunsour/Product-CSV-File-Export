import type { MediaAsset } from "~/types/db";

export type MediaListResponse = {
  items: MediaAsset[];
  total: number;
  offset: number;
  limit: number;
};

export const mediaService = {
  list: (params: Record<string, any>) =>
    $fetch<MediaListResponse>("/api/media/list", { query: params })
};
