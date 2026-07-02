<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-slate-950/70" @click.self="close"></div>
      <div class="relative mx-auto mt-8 w-[min(95vw,1200px)] rounded-3xl border border-slate-800/60 bg-slate-950/90 p-6 shadow-2xl">
        <header class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Media Vault</p>
            <h2 class="text-xl font-semibold text-slate-100">Add images from Image Library</h2>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="btn-ghost px-3 py-1.5 text-xs" @click="close">
              Cancel
            </button>
            <button type="button" class="btn-primary px-4 py-1.5 text-xs" @click="confirm">
              Add selected
            </button>
          </div>
        </header>

        <div class="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <section class="space-y-4">
            <FiltersBar
              :search="filters.search"
              :source="filters.source"
              :format="filters.format"
              :sort="filters.sort"
              :view-mode="viewMode"
              :active-category="filters.category"
              :categories="categoryOptions"
              @update:search="updateFilter('search', $event)"
              @update:source="updateFilter('source', $event)"
              @update:format="updateFilter('format', $event)"
              @update:sort="updateFilter('sort', $event)"
              @update:category="updateFilter('category', $event)"
              @update:view-mode="viewMode = $event"
            />

            <div class="min-h-[260px]">
              <div v-if="loading" class="grid gap-2 sm:grid-cols-2">
                <div v-for="n in 4" :key="n" class="h-32 animate-pulse rounded-2xl bg-slate-800/50"></div>
              </div>
              <div v-else-if="error" class="text-sm text-rose-200">{{ error }}</div>
              <MediaGrid
                v-else-if="viewMode === 'grid'"
                :items="displayItems"
                :selected-ids="selectedIdsList"
                @toggle="toggleItem"
              />
              <MediaList
                v-else
                :items="displayItems"
                :selected-ids="selectedIdsList"
                @toggle="toggleItem"
              />
            </div>

            <div class="flex items-center justify-between">
              <p class="text-xs text-slate-400">
                Showing {{ displayItems.length }} of {{ total }} images
              </p>
              <button
                v-if="hasMore"
                type="button"
                class="btn-ghost px-3 py-1.5 text-xs"
                :disabled="loading"
                @click="loadMore"
              >
                Load more
              </button>
            </div>
          </section>

          <aside class="space-y-4">
            <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Selected</p>
                  <p class="text-sm text-slate-200">Order + featured image</p>
                </div>
                <button
                  type="button"
                  class="text-xs text-slate-400 hover:text-slate-200"
                  @click="clearSelection"
                >
                  Clear
                </button>
              </div>
              <p class="mt-2 text-xs text-slate-500">
                Drag to reorder. First image becomes featured.
              </p>
            </div>

            <AttachmentsPreview
              :items="selected"
              compact
              @remove="removeByIndex"
              @reorder="reorder"
              @set-featured="setFeatured"
            />

            <SelectionBar
              :count="selected.length"
              @clear="clearSelection"
              @make-featured="makeFirstFeatured"
              @confirm="confirm"
            />
          </aside>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ProductImage, MediaAsset } from "~/types/db";
import { useMediaLibrary } from "~/composables/useMediaLibrary";
import { useMediaPicker } from "~/composables/useMediaPicker";
import FiltersBar from "~/components/media/FiltersBar.vue";
import MediaGrid from "~/components/media/MediaGrid.vue";
import MediaList from "~/components/media/MediaList.vue";
import SelectionBar from "~/components/media/SelectionBar.vue";
import AttachmentsPreview from "~/components/product/AttachmentsPreview.vue";

type CategoryOption = { key: string; label: string };

const props = defineProps<{
  open: boolean;
  initialSelection: ProductImage[];
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "confirm", value: ProductImage[]): void;
}>();

const close = () => emit("update:open", false);

const { items, total, filters, loading, error, hasMore, refresh, loadMore } =
  useMediaLibrary("image");

const { selected, selectedIds, toggleAsset, removeByIndex, setFeatured, reorder, replaceAll } =
  useMediaPicker([]);

const selectedIdsList = computed(() => Array.from(selectedIds.value));

const viewMode = ref<"grid" | "list">("grid");

const categoryOptions: CategoryOption[] = [
  { key: "mini-excavator", label: "Mini Excavator" },
  { key: "forklift", label: "Forklift" },
  { key: "road-roller", label: "Road Roller" },
  { key: "skid-steer", label: "Skid Steer" },
  { key: "attachments", label: "Attachments" }
];

const displayItems = computed(() => {
  return items.value.map((item) => {
    const preview =
      item.media_variants?.find((variant) => variant.variant === "thumb")?.public_url ||
      item.public_url ||
      item.external_url ||
      "";
    const displayUrl = item.public_url || item.external_url || "";
    const fileName = item.storage_path?.split("/").pop() || displayUrl.split("/").pop() || item.id;
    return {
      ...item,
      previewUrl: preview,
      displayUrl,
      fileName
    };
  });
});

const updateFilter = (key: keyof typeof filters, value: string) => {
  filters[key] = value as never;
};

watch(
  () => props.open,
  (value) => {
    if (!value) return;
    replaceAll(props.initialSelection || []);
    refresh();
  }
);

watch(
  () => ({ ...filters }),
  () => {
    if (!props.open) return;
    refresh();
  },
  { deep: true }
);

const toggleItem = (item: MediaAsset) => {
  toggleAsset(item);
};

const clearSelection = () => {
  replaceAll([]);
};

const makeFirstFeatured = () => {
  if (!selected.value.length) return;
  setFeatured(0);
};

const confirm = () => {
  const normalized = selected.value.map((item, index) => ({
    ...item,
    is_primary: index === 0,
    sort_order: index
  }));
  emit("confirm", normalized);
  close();
};

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.open) return;
  if (event.key === "Escape") {
    close();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>
