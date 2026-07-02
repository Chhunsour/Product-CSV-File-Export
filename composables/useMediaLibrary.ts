import type { MediaAsset } from "~/types/db";
import { mediaService } from "~/services/mediaService";

type MediaFilters = {
  search: string;
  source: "all" | "stored" | "linked";
  format: string;
  category: string;
  sort: "newest" | "oldest" | "size";
};

export const useMediaLibrary = (kind: "image" | "video" = "image") => {
  const items = ref<MediaAsset[]>([]);
  const total = ref(0);
  const offset = ref(0);
  const limit = ref(30);
  const loading = ref(false);
  const error = ref("");
  const filters = reactive<MediaFilters>({
    search: "",
    source: "all",
    format: "all",
    category: "",
    sort: "newest"
  });

  const hasMore = computed(() => items.value.length < total.value);

  const fetchPage = async (reset = true) => {
    loading.value = true;
    error.value = "";
    try {
      const nextOffset = reset ? 0 : offset.value + limit.value;
      const response = await mediaService.list({
        kind,
        limit: limit.value,
        offset: nextOffset,
        search: filters.search || undefined,
        category: filters.category || undefined,
        source: filters.source === "all" ? undefined : filters.source,
        format: filters.format === "all" ? undefined : filters.format,
        sort: filters.sort
      });

      if (reset) {
        items.value = response.items ?? [];
      } else {
        items.value = [...items.value, ...(response.items ?? [])];
      }
      total.value = response.total ?? 0;
      offset.value = response.offset ?? nextOffset;
    } catch (err) {
      const errorObj = err as Error;
      error.value = errorObj.message || "Failed to load media library.";
    } finally {
      loading.value = false;
    }
  };

  const refresh = () => fetchPage(true);
  const loadMore = () => fetchPage(false);

  return {
    items,
    total,
    offset,
    limit,
    filters,
    loading,
    error,
    hasMore,
    refresh,
    loadMore
  };
};
