import type { MediaAsset, MediaStats } from "~/types/db";

export type MediaListResponse = {
  items: MediaAsset[];
  total: number;
  offset: number;
  limit: number;
};

export const useMediaVault = () => {
  const listMedia = async (params: Record<string, any>): Promise<MediaListResponse> => {
    return await $fetch("/api/media/list", { query: params });
  };

  const getStats = async (kind: "image" | "video"): Promise<MediaStats> => {
    return await $fetch("/api/media/stats", { query: { kind } });
  };

  const uploadMedia = async (formData: FormData) => {
    return await $fetch("/api/media/upload", { method: "POST", body: formData });
  };

  const convertWebp = async (ids: string[]) => {
    return await $fetch("/api/media/convert-webp", { method: "POST", body: { ids } });
  };

  const deleteMedia = async (ids: string[]) => {
    return await $fetch("/api/media/delete", { method: "POST", body: { ids } });
  };

  const deleteFolder = async (payload: {
    kind: "image" | "video";
    category?: string;
    folder: string;
  }) => {
    return await $fetch("/api/media/delete-folder", { method: "POST", body: payload });
  };

  const importMedia = async (payload: {
    kind: "image" | "video";
    productId?: string;
    assetIds?: string[];
    mode?: "linked" | "stored";
  }) => {
    return await $fetch("/api/media/import", { method: "POST", body: payload });
  };

  return {
    listMedia,
    getStats,
    uploadMedia,
    convertWebp,
    deleteMedia,
    deleteFolder,
    importMedia
  };
};
