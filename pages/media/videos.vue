<template>
  <section class="page-shell page-media page-media-videos">
    <div class="page-surface">
      <div class="compact-shell">
        <div class="panel compact-panel media-hero">
          <div class="media-hero-top">
            <div>
              <p class="compact-subtitle uppercase tracking-[0.3em]">{{ t("media.videos.system") }}</p>
              <h1 class="compact-title">{{ t("media.videos.title") }}</h1>
              <p class="compact-subtitle">{{ t("media.videos.subtitle") }}</p>
            </div>
            <div class="media-hero-actions">
              <button
                type="button"
                class="btn-ghost text-xs px-3 py-1.5"
                :disabled="loading"
                @click="refreshMedia"
              >
                {{ t("media.refresh") }}
              </button>
              <button
                type="button"
                class="btn-primary text-xs px-3 py-1.5"
                :disabled="!supportsClipboard || !media.length"
                @click="copyLinks"
              >
                {{ t("media.copy_links") }}
              </button>
              <button
                type="button"
                class="btn-ghost text-xs px-3 py-1.5"
                @click="toggleSelectionMode"
              >
                {{ selectionMode ? t("media.done") : t("media.select") }}
              </button>
            </div>
          </div>

          <div class="media-hero-stats">
            <div class="media-stat">
              <span>{{ t("media.total") }}</span>
              <strong>{{ stats?.total ?? 0 }}</strong>
              <small>{{ t("media.videos") }}</small>
            </div>
            <div class="media-stat">
              <span>{{ t("media.stored") }}</span>
              <strong>{{ stats?.stored ?? 0 }}</strong>
              <small>{{ t("media.files") }}</small>
            </div>
            <div class="media-stat">
              <span>{{ t("media.linked") }}</span>
              <strong>{{ stats?.linked ?? 0 }}</strong>
              <small>{{ t("media.external") }}</small>
            </div>
            <div class="media-stat">
              <span>{{ t("media.items") }}</span>
              <strong>{{ stats?.items ?? 0 }}</strong>
              <small>{{ t("media.products") }}</small>
            </div>
            <div class="media-stat">
              <span>{{ t("media.formats") }}</span>
              <strong>{{ formatCount }}</strong>
              <small>{{ t("media.types") }}</small>
            </div>
            <div class="media-stat">
              <span>{{ t("media.updated") }}</span>
              <strong>{{ lastUpdated }}</strong>
              <small>{{ t("media.latest") }}</small>
            </div>
          </div>

          <p v-if="copyStatus" class="media-copy-status">{{ copyStatus }}</p>

          <div v-if="canUpload" class="media-uploader">
            <div class="media-uploader-head">
              <div>
                <p class="media-uploader-title">{{ t("media.add_video") }}</p>
                <p class="media-uploader-subtitle">
                  {{ t("media.add_video_sub") }}
                </p>
              </div>
              <div class="media-uploader-meta">
                <span class="chip">{{ t("media.media_vault") }}</span>
                <span class="chip">Bucket: media</span>
              </div>
            </div>

            <div class="media-uploader-grid">
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.save_to") }}</label>
                <div class="media-vault-pill">{{ t("media.media_vault") }}</div>
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.category_select") }}</label>
                <select v-model="uploadCategory" class="select-compact">
                  <option value="">{{ t("media.category_placeholder") }}</option>
                  <option
                    v-for="category in CATEGORY_DEFS"
                    :key="category.key"
                    :value="category.key"
                  >
                    {{ t(category.labelKey) }}
                  </option>
                </select>
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.product_slug") }}</label>
                <input
                  v-model="uploadProductSlug"
                  type="text"
                  :placeholder="t('media.product_slug_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.product_id") }}</label>
                <input
                  v-model="uploadProductId"
                  type="text"
                  :placeholder="t('media.product_id_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.poster_asset") }}</label>
                <input
                  v-model="uploadPosterAssetId"
                  type="text"
                  :placeholder="t('media.poster_asset_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.label") }}</label>
                <input
                  v-model="uploadLabel"
                  type="text"
                  :placeholder="t('media.label_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.title_text") }}</label>
                <input
                  v-model="uploadTitle"
                  type="text"
                  :placeholder="t('media.title_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.video_file") }}</label>
                <input
                  ref="fileInput"
                  type="file"
                  accept="video/*"
                  class="media-file-input"
                  @change="handleFileChange"
                />
              </div>
            </div>

            <div class="media-uploader-actions">
              <div class="media-uploader-stack">
                <p class="media-helper">
                  {{ t("media.video_helper") }}
                </p>
                <p v-if="uploadHint" class="media-helper">{{ uploadHint }}</p>
              </div>
              <button
                type="button"
                class="btn-primary text-xs px-3 py-1.5"
                :disabled="uploadDisabled"
                @click="handleUpload"
              >
                {{ uploadLoading ? t("media.uploading") : t("media.upload_video") }}
              </button>
            </div>

            <p v-if="uploadError" class="media-error">{{ uploadError }}</p>
            <p v-if="uploadSuccess" class="media-success">{{ uploadSuccess }}</p>
            <p v-if="itemsError" class="media-error">{{ itemsError }}</p>
          </div>

          <div class="media-controls">
            <div class="media-search">
              <span class="search-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="7"></circle>
                  <path d="M20 20l-3.5-3.5"></path>
                </svg>
              </span>
              <input
                v-model="query"
                type="text"
                :placeholder="t('media.search_videos')"
                class="input-compact pl-9"
              />
            </div>
            <div class="media-controls-right">
              <select v-model="sortKey" class="select-compact">
                <option value="newest">{{ t("media.sort_newest") }}</option>
                <option value="oldest">{{ t("media.sort_oldest") }}</option>
                <option value="name">{{ t("media.sort_name") }}</option>
              </select>
              <div class="media-view-toggle">
                <button
                  type="button"
                  class="media-toggle"
                  :class="viewMode === 'grid' ? 'media-toggle-active' : ''"
                  @click="viewMode = 'grid'"
                >
                  {{ t("media.view_grid") }}
                </button>
                <button
                  type="button"
                  class="media-toggle"
                  :class="viewMode === 'list' ? 'media-toggle-active' : ''"
                  @click="viewMode = 'list'"
                >
                  {{ t("media.view_list") }}
                </button>
              </div>
              <button
                v-if="query"
                type="button"
                class="filter-pill text-[11px]"
                @click="query = ''"
              >
                {{ t("media.clear") }}
              </button>
            </div>
          </div>

          <div class="media-filter-row">
            <span class="media-filter-label">{{ t("media.source") }}</span>
            <button
              type="button"
              class="filter-pill"
              :class="sourceFilter === 'all' ? 'filter-pill-active' : ''"
              @click="sourceFilter = 'all'"
            >
              {{ t("media.filter_all") }}
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="sourceFilter === 'stored' ? 'filter-pill-active' : ''"
              @click="sourceFilter = 'stored'"
            >
              {{ t("media.filter_stored") }}
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="sourceFilter === 'linked' ? 'filter-pill-active' : ''"
              @click="sourceFilter = 'linked'"
            >
              {{ t("media.filter_linked") }}
            </button>
          </div>

          <div class="media-filter-row">
            <span class="media-filter-label">{{ t("media.format") }}</span>
            <button
              type="button"
              class="filter-pill"
              :class="formatFilter === 'all' ? 'filter-pill-active' : ''"
              @click="formatFilter = 'all'"
            >
              {{ t("media.filter_all") }}
            </button>
            <button
              v-for="format in formatOptions"
              :key="format.format"
              type="button"
              class="filter-pill"
              :class="formatFilter === format.format ? 'filter-pill-active' : ''"
              @click="formatFilter = format.format"
            >
              {{ format.label }} {{ format.count }}
            </button>
          </div>

          <div class="media-filter-row">
            <span class="media-filter-label">{{ t("media.category") }}</span>
            <button
              type="button"
              class="filter-pill"
              :class="categoryFilter === 'all' ? 'filter-pill-active' : ''"
              @click="categoryFilter = 'all'"
            >
              {{ t("media.filter_all") }}
            </button>
            <button
              v-for="category in categoryOptions"
              :key="category.key"
              type="button"
              class="filter-pill"
              :class="categoryFilter === category.key ? 'filter-pill-active' : ''"
              @click="categoryFilter = category.key"
            >
              {{ category.label }} {{ category.count }}
            </button>
          </div>

          <div v-if="selectionMode || selectedCount" class="media-bulk">
            <div class="media-bulk-left">
              <span class="media-bulk-count">{{ t("media.selected_count", { count: String(selectedCount) }) }}</span>
              <button type="button" class="filter-pill" @click="toggleSelectAll">
                {{ allFilteredSelected ? t("media.clear_selection") : t("media.select_all") }}
              </button>
              <button
                v-if="selectedCount"
                type="button"
                class="filter-pill"
                @click="clearSelection"
              >
                {{ t("media.clear") }}
              </button>
            </div>
            <div class="media-bulk-actions">
              <select
                v-model="importItemId"
                class="select-compact"
                :disabled="itemsLoading || !importItems.length"
              >
                <option value="" disabled>{{ t("media.select_item") }}</option>
                <option v-for="item in importItems" :key="item.id" :value="item.id">
                  {{ itemLabel(item) }}
                </option>
              </select>
              <select v-model="importMode" class="select-compact">
                <option value="linked">{{ t("media.import_linked") }}</option>
                <option value="stored">{{ t("media.import_stored") }}</option>
              </select>
              <button
                type="button"
                class="btn-ghost text-xs px-3 py-1.5"
                :disabled="bulkImportDisabled"
                @click="bulkImport"
              >
                {{ t("media.import") }}
              </button>
              <div class="media-bulk-divider"></div>
              <button
                type="button"
                class="btn-ghost text-xs px-3 py-1.5 text-rose-200"
                :disabled="bulkDeleteDisabled"
                @click="bulkDelete"
              >
                {{ t("media.delete") }}
              </button>
            </div>
            <span v-if="bulkBusy" class="media-bulk-message">{{ t("media.working") }}</span>
          </div>
          <p v-if="bulkError" class="media-bulk-error">{{ bulkError }}</p>
          <p v-if="bulkSuccess" class="media-bulk-success">{{ bulkSuccess }}</p>
        </div>

        <div class="compact-scroll">
          <div v-if="loading" class="grid gap-2 md:grid-cols-2">
            <div v-for="n in 6" :key="n" class="skeleton h-32"></div>
          </div>

          <div v-else-if="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <div v-else class="space-y-3">
            <div v-if="!canUseMedia" class="card border-dashed border-slate-700/60 p-4 text-xs text-slate-400">
              {{ t("media.sign_in_video") }}
            </div>

            <div
              v-else-if="filteredMedia.length"
              :class="viewMode === 'grid' ? 'media-grid stagger' : 'media-list'"
            >
              <article
                v-for="item in filteredMedia"
                :key="item.id"
                class="media-card"
                :class="viewMode === 'list' ? 'media-card-list' : ''"
              >
                <button
                  v-if="selectionMode"
                  type="button"
                  class="media-select"
                  :class="selectedSet.has(item.id) ? 'media-select-active' : ''"
                  @click="toggleSelect(item.id)"
                >
                  <span></span>
                </button>
                <div class="media-preview">
                  <video
                    v-if="item.previewUrl"
                    :src="item.previewUrl"
                    class="media-video"
                    controls
                    muted
                    playsinline
                  ></video>
                  <div v-else class="media-placeholder">{{ t("media.no_preview") }}</div>
                  <div class="media-actions">
                    <a
                      :href="item.displayUrl"
                      class="media-action"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {{ t("media.open") }}
                    </a>
                    <button
                      type="button"
                      class="media-action"
                      :disabled="!supportsClipboard"
                      @click="copyLink(item)"
                    >
                      {{ t("media.copy") }}
                    </button>
                  </div>
                </div>
                <div class="media-meta">
                  <div class="media-title-row">
                    <p class="text-sm font-semibold text-slate-100 truncate">
                      {{ item.label || item.fileName }}
                    </p>
                    <span class="media-format">{{ formatLabel(item.extension) }}</span>
                  </div>
                  <p class="compact-meta truncate">{{ item.fileName }}</p>
                  <p class="compact-meta truncate">{{ item.shortUrl || item.displayUrl }}</p>
                  <div class="media-meta-row">
                    <span>{{ item.source === 'stored' ? t("media.filter_stored") : t("media.filter_linked") }}</span>
                    <span>{{ formatDate(item.created_at) }}</span>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="card border-dashed border-slate-700/60 p-4 text-xs text-slate-400">
              {{ t("media.no_videos") }}
            </div>

            <div v-if="hasMore" class="flex justify-center pt-2">
              <button
                type="button"
                class="btn-ghost text-xs px-4 py-2"
                :disabled="loadingMore"
                @click="loadMore"
              >
                {{ t("media.load_more") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaAsset, MediaStats, MediaVariant, WorkspaceItem } from "~/types/db";

type SortKey = "newest" | "oldest" | "name";
type SourceFilter = "all" | "stored" | "linked";
type CategoryKey = "mini-excavator" | "forklift" | "road-roller" | "skid-steer" | "attachments";

type MediaCard = MediaAsset & {
  previewUrl: string;
  displayUrl: string;
  shortUrl: string;
  fileName: string;
  extension: string;
  variants: MediaVariant[];
};

const CATEGORY_DEFS: { key: CategoryKey; labelKey: string }[] = [
  { key: "mini-excavator", labelKey: "media.category.mini_excavator" },
  { key: "forklift", labelKey: "media.category.forklift" },
  { key: "road-roller", labelKey: "media.category.road_roller" },
  { key: "skid-steer", labelKey: "media.category.skid_steer" },
  { key: "attachments", labelKey: "media.category.attachments" }
];

const user = useSupabaseUser();
const runtimeConfig = useRuntimeConfig();
const devOwnerId = computed(() => runtimeConfig.public.devOwnerId || "");
const canUpload = computed(() => Boolean(user.value || devOwnerId.value));
const canUseMedia = computed(() => Boolean(user.value || devOwnerId.value));
const { listItems } = useItems();
const { listMedia, getStats, uploadMedia, deleteMedia, importMedia } = useMediaVault();
const { t } = useLocale();

const media = ref<MediaCard[]>([]);
const stats = ref<MediaStats | null>(null);
const query = ref("");
const loading = ref(false);
const loadingMore = ref(false);
const errorMessage = ref("");
const viewMode = ref<"grid" | "list">("grid");
const sortKey = ref<SortKey>("newest");
const formatFilter = ref("all");
const sourceFilter = ref<SourceFilter>("all");
const categoryFilter = ref<"all" | CategoryKey>("all");
const copyStatus = ref("");
const supportsClipboard = ref(false);
const selectionMode = ref(false);
const selectedIds = ref<string[]>([]);
const bulkDeleteLoading = ref(false);
const bulkImportLoading = ref(false);
const bulkError = ref("");
const bulkSuccess = ref("");
const importItemId = ref("");
const importMode = ref<"linked" | "stored">("linked");
const items = ref<WorkspaceItem[]>([]);
const itemsLoading = ref(false);
const itemsError = ref("");
const selectedFile = ref<File | null>(null);
const uploadLabel = ref("");
const uploadCategory = ref("");
const uploadProductSlug = ref("");
const uploadProductId = ref("");
const uploadPosterAssetId = ref("");
const uploadTitle = ref("");
const uploadLoading = ref(false);
const uploadError = ref("");
const uploadSuccess = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const pageSize = 48;
const offset = ref(0);
const total = ref(0);

const formatLabel = (value: string) => {
  if (!value) return "FILE";
  return value.toUpperCase();
};

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const fileNameFromUrl = (value: string) => {
  const cleaned = value.split("?")[0] || "";
  const parts = cleaned.split("/");
  return parts[parts.length - 1] || "media";
};

const mapMedia = (items: MediaAsset[]): MediaCard[] => {
  return items.map((item) => {
    const variants = (item.media_variants || []) as MediaVariant[];
    const displayUrl = item.public_url || item.external_url || "";
    const previewUrl = displayUrl;
    const fileName = item.storage_path ? item.storage_path.split("/").pop() || "media" : fileNameFromUrl(displayUrl);
    return {
      ...item,
      previewUrl,
      displayUrl,
      shortUrl: item.short_url || "",
      fileName,
      extension: item.ext || fileName.split(".").pop() || "",
      variants
    } as MediaCard;
  });
};

const itemLabel = (item: WorkspaceItem) => {
  return item.sku ? `${item.title} - SKU ${item.sku}` : item.title;
};

const formatOptions = computed(() => {
  const counts = stats.value?.formatCounts ?? {};
  return Object.entries(counts)
    .map(([format, count]) => ({
      format,
      label: format.toUpperCase(),
      count
    }))
    .sort((a, b) => b.count - a.count);
});

const formatCount = computed(() => formatOptions.value.length);

const categoryOptions = computed(() => {
  const counts = stats.value?.categoryCounts ?? {};
  return CATEGORY_DEFS.map((def) => ({
    key: def.key,
    label: t(def.labelKey),
    count: counts[def.key] ?? 0
  }));
});

const selectedSet = computed(() => new Set(selectedIds.value));
const selectedItems = computed(() => {
  const set = selectedSet.value;
  return media.value.filter((item) => set.has(item.id));
});
const selectedCount = computed(() => selectedIds.value.length);
const allFilteredSelected = computed(() => {
  if (!media.value.length) return false;
  const set = selectedSet.value;
  return media.value.every((item) => set.has(item.id));
});

const importItems = computed(() => items.value);
const filteredMedia = computed(() => media.value);

const lastUpdated = computed(() => {
  if (!stats.value?.updatedAt) return t("media.no_updates");
  return formatDate(stats.value.updatedAt);
});

const uploadDisabled = computed(() => {
  return !selectedFile.value || uploadLoading.value;
});

const bulkBusy = computed(() => {
  return bulkDeleteLoading.value || bulkImportLoading.value;
});

const bulkDeleteDisabled = computed(() => {
  return !selectedCount.value || bulkBusy.value;
});

const bulkImportDisabled = computed(() => {
  return !importItemId.value || itemsLoading.value || bulkBusy.value;
});

const hasMore = computed(() => media.value.length < total.value);

const uploadHint = computed(() => {
  if (!selectedFile.value) return t("media.choose_file");
  return "";
});

const resetBulkStatus = () => {
  bulkError.value = "";
  bulkSuccess.value = "";
};

const clearSelection = () => {
  selectedIds.value = [];
};

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value;
  resetBulkStatus();
  if (!selectionMode.value) {
    clearSelection();
  }
};

const toggleSelect = (id: string) => {
  resetBulkStatus();
  if (selectedSet.value.has(id)) {
    selectedIds.value = selectedIds.value.filter((value) => value !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
};

const toggleSelectAll = () => {
  resetBulkStatus();
  if (allFilteredSelected.value) {
    clearSelection();
    return;
  }
  selectedIds.value = media.value.map((item) => item.id);
};

const resetUploadState = () => {
  selectedFile.value = null;
  uploadLabel.value = "";
  uploadTitle.value = "";
  uploadPosterAssetId.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const setCopyStatus = (message: string) => {
  copyStatus.value = message;
  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      copyStatus.value = "";
    }, 2000);
  }
};

const copyLinks = async () => {
  const itemsToCopy = selectedCount.value ? selectedItems.value : media.value;
  if (!itemsToCopy.length) {
    setCopyStatus(t("media.copy_links_empty"));
    return;
  }
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    setCopyStatus(t("media.clipboard_unavailable"));
    return;
  }

  try {
    const payload = itemsToCopy
      .map((item) => `${item.shortUrl || ""} | ${item.displayUrl || ""} | ${item.title || item.label || ""}`)
      .join("\n");
    await navigator.clipboard.writeText(payload);
    setCopyStatus(t("media.copy_links_selected", { count: String(itemsToCopy.length) }));
  } catch (error) {
    setCopyStatus(t("media.copy_failed"));
  }
};

const copyLink = async (item: MediaCard) => {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    setCopyStatus(t("media.clipboard_unavailable"));
    return;
  }

  try {
    await navigator.clipboard.writeText(item.shortUrl || item.displayUrl || "");
    setCopyStatus(t("media.link_copied"));
  } catch (error) {
    setCopyStatus(t("media.copy_failed"));
  }
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  selectedFile.value = file;
  uploadError.value = "";
  uploadSuccess.value = "";
  if (file && !uploadLabel.value) {
    uploadLabel.value = file.name;
  }
};

const loadStats = async () => {
  try {
    stats.value = await getStats("video");
  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || t("media.failed_load_videos");
  }
};

const loadMedia = async (reset = true) => {
  if (!canUseMedia.value) return;
  if (reset) {
    loading.value = true;
    offset.value = 0;
  } else {
    loadingMore.value = true;
  }
  errorMessage.value = "";

  try {
    const response = await listMedia({
      kind: "video",
      source: sourceFilter.value,
      format: formatFilter.value,
      category: categoryFilter.value,
      search: query.value,
      sort: sortKey.value,
      limit: pageSize,
      offset: reset ? 0 : offset.value
    });

    const mapped = mapMedia(response.items);
    media.value = reset ? mapped : [...media.value, ...mapped];
    total.value = response.total;
    offset.value = media.value.length;
  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || t("media.failed_load_videos");
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

const refreshMedia = async () => {
  await Promise.all([loadMedia(true), loadStats()]);
};

const loadMore = async () => {
  if (!hasMore.value) return;
  await loadMedia(false);
};

const handleUpload = async () => {
  if (!selectedFile.value) {
    uploadError.value = t("media.choose_file_first");
    uploadSuccess.value = "";
    return;
  }

  uploadLoading.value = true;
  uploadError.value = "";
  uploadSuccess.value = "";

  try {
    const formData = new FormData();
    formData.append("kind", "video");
    const resolvedCategory = uploadCategory.value || (categoryFilter.value === "all" ? "" : categoryFilter.value);
    if (resolvedCategory) formData.append("category", resolvedCategory);
    if (uploadProductSlug.value) formData.append("productSlug", uploadProductSlug.value);
    if (uploadProductId.value) formData.append("productId", uploadProductId.value);
    if (uploadPosterAssetId.value) formData.append("posterAssetId", uploadPosterAssetId.value);
    if (uploadLabel.value) formData.append("label", uploadLabel.value);
    if (uploadTitle.value) formData.append("title", uploadTitle.value);
    formData.append("file", selectedFile.value);

    await uploadMedia(formData);
    uploadSuccess.value = t("media.video_added");
    resetUploadState();
    await refreshMedia();
  } catch (error) {
    const err = error as Error;
    uploadError.value = err.message || t("media.failed_upload_video");
  } finally {
    uploadLoading.value = false;
  }
};

const bulkDelete = async () => {
  if (!selectedItems.value.length) return;
  if (typeof window !== "undefined") {
    const confirmDelete = window.confirm(
      t("media.confirm_delete_videos", { count: String(selectedItems.value.length) })
    );
    if (!confirmDelete) return;
  }

  bulkDeleteLoading.value = true;
  resetBulkStatus();

  try {
    await deleteMedia(selectedItems.value.map((item) => item.id));
    bulkSuccess.value = t("media.deleted_items", { count: String(selectedItems.value.length) });
    clearSelection();
    await refreshMedia();
  } catch (error) {
    const err = error as Error;
    bulkError.value = err.message || t("media.failed_delete_selection");
  } finally {
    bulkDeleteLoading.value = false;
  }
};

const bulkImport = async () => {
  if (!importItemId.value) {
    bulkError.value = t("media.select_destination");
    return;
  }

  bulkImportLoading.value = true;
  resetBulkStatus();

  try {
    const response = await importMedia({
      kind: "video",
      productId: importItemId.value,
      assetIds: selectedIds.value,
      mode: importMode.value
    });

    const count = response.created || response.updated || selectedIds.value.length || 0;
    bulkSuccess.value = t("media.imported_items", { count: String(count) });
    clearSelection();
    await refreshMedia();
  } catch (error) {
    const err = error as Error;
    bulkError.value = err.message || t("media.failed_import");
  } finally {
    bulkImportLoading.value = false;
  }
};

const loadItems = async () => {
  if (!canUseMedia.value) return;
  itemsLoading.value = true;
  itemsError.value = "";

  try {
    items.value = await listItems();
  } catch (error) {
    const err = error as Error;
    itemsError.value = err.message || t("media.failed_load_items");
  } finally {
    itemsLoading.value = false;
  }
};

let searchTimer: ReturnType<typeof setTimeout> | null = null;

watch(query, () => {
  if (searchTimer) window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    refreshMedia();
  }, 300);
});

watch([sourceFilter, formatFilter, categoryFilter, sortKey], () => {
  refreshMedia();
});

watch(user, () => {
  refreshMedia();
  loadItems();
});

watch(media, () => {
  const ids = new Set(media.value.map((item) => item.id));
  selectedIds.value = selectedIds.value.filter((id) => ids.has(id));
});

onMounted(() => {
  supportsClipboard.value = typeof navigator !== "undefined" && !!navigator.clipboard;
  refreshMedia();
  loadItems();
});
</script>
