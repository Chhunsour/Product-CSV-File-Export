<template>
  <div class="space-y-3 product-images-field">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <label class="text-sm font-medium text-slate-700">{{ label }}</label>
      <button type="button" class="btn-ghost text-xs px-3 py-1.5" @click="openPicker">
        Add from Image Library
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span class="text-xs text-slate-500">Display format</span>
      <div class="flex items-center rounded-full border border-slate-200 bg-white/5 p-1">
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs"
          :class="format === 'pipe' ? 'bg-brand-500/20 text-brand-700' : 'text-slate-500'"
          @click="setFormat('pipe')"
        >
          Woo format (|)
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs"
          :class="format === 'comma' ? 'bg-brand-500/20 text-brand-700' : 'text-slate-500'"
          @click="setFormat('comma')"
        >
          Comma (,)
        </button>
      </div>
      <button
        type="button"
        class="ml-auto rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
        @click="makeFirstFeatured"
      >
        Make first featured
      </button>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white/5 p-3">
      <p class="text-xs font-semibold text-slate-600">Use folder images</p>
      <p class="mt-1 text-xs text-slate-500">
        Choose a category folder to auto-load all images (oldest = featured).
      </p>
      <div class="mt-2 grid gap-2 sm:grid-cols-3">
        <select v-model="folderCategory" class="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs">
          <option value="all">All categories</option>
          <option v-for="category in categoryOptions" :key="category.key" :value="category.key">
            {{ category.label }}
          </option>
        </select>
        <select v-model="folderName" class="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs">
          <option value="">Select folder</option>
          <option v-for="folder in folderOptions" :key="folder.name" :value="folder.name">
            {{ folder.name }} ({{ folder.count }})
          </option>
        </select>
        <button
          type="button"
          class="btn-ghost px-3 py-2 text-xs"
          :disabled="folderLoading || !folderName"
          @click="applyFolder"
        >
          {{ folderLoading ? "Loading..." : "Use folder" }}
        </button>
      </div>
      <p v-if="folderError" class="mt-2 text-xs text-rose-500">{{ folderError }}</p>
    </div>

    <div v-if="selectedFolder" class="rounded-xl border border-slate-200 bg-white/5 p-3">
      <p class="text-xs font-semibold text-slate-600">Folder preview</p>
      <div class="mt-2 flex items-center gap-3">
        <div class="h-12 w-12 overflow-hidden rounded-lg bg-slate-200/40">
          <img
            v-if="selectedFolder.coverUrl"
            :src="selectedFolder.coverUrl"
            alt="Folder cover"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
            No cover
          </div>
        </div>
        <div class="text-xs text-slate-500">
          <p>{{ selectedFolder.count }} images in folder</p>
          <p>Oldest image will be featured</p>
        </div>
      </div>
    </div>

    <textarea
      :value="inputValue"
      rows="2"
      class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      placeholder="Paste image URLs here"
      @input="handleInput"
    ></textarea>

    <div v-if="hasWarnings" class="space-y-1 text-xs text-rose-500">
      <p v-if="duplicateUrls.length">Duplicate URLs detected: {{ duplicateUrls.length }}</p>
      <p v-if="signedUrls.length">Signed URLs detected. Use public Media Vault URLs only.</p>
    </div>

    <AttachmentsPreview
      :items="modelValue"
      @remove="removeImage"
      @reorder="reorderImages"
      @set-featured="setFeatured"
    />

    <MediaPickerModal
      v-model:open="pickerOpen"
      :initial-selection="modelValue"
      @confirm="applySelection"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProductImage, MediaAsset } from "~/types/db";
import { parseImagesField } from "~/utils/parseImagesField";
import AttachmentsPreview from "~/components/product/AttachmentsPreview.vue";
import MediaPickerModal from "~/components/media/MediaPickerModal.vue";

const props = defineProps<{
  modelValue: ProductImage[];
  textValue?: string;
  label?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: ProductImage[]): void;
  (e: "update:textValue", value: string): void;
}>();

const label = computed(() => props.label || "Images (comma separated URLs)");
const pickerOpen = ref(false);
const inputValue = ref(props.textValue || "");
const format = ref<"pipe" | "comma">(
  props.textValue?.includes("|") ? "pipe" : props.textValue?.includes(",") ? "comma" : "pipe"
);
const folderCategory = ref("all");
const folderName = ref("");
type FolderOption = { name: string; count: number; coverUrl: string | null };

const folderOptions = ref<FolderOption[]>([]);
const folderLoading = ref(false);
const folderError = ref("");

const categoryOptions = [
  { key: "mini-excavator", label: "Mini Excavator" },
  { key: "forklift", label: "Forklift" },
  { key: "road-roller", label: "Road Roller" },
  { key: "skid-steer", label: "Skid Steer" },
  { key: "attachments", label: "Attachments" }
];

const openPicker = () => {
  pickerOpen.value = true;
};

const joinForDisplay = (items: ProductImage[]) => {
  const separator = format.value === "pipe" ? " | " : ", ";
  return items.map((item) => item.url).join(separator);
};

const buildImagesFromUrls = (urls: string[]) => {
  const existing = new Map(props.modelValue.map((item) => [item.url, item]));
  return urls.map((url, index) => {
    const prev = existing.get(url);
    return {
      asset_id: prev?.asset_id ?? null,
      url,
      alt: prev?.alt ?? "",
      is_primary: index === 0,
      sort_order: index
    } satisfies ProductImage;
  });
};

const syncTextFromModel = () => {
  const next = joinForDisplay(props.modelValue);
  if (next !== inputValue.value) {
    inputValue.value = next;
    emit("update:textValue", next);
  }
};

const setFormat = (value: "pipe" | "comma") => {
  format.value = value;
  syncTextFromModel();
};

const handleInput = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value;
  inputValue.value = value;
  const urls = parseImagesField(value);
  emit("update:modelValue", buildImagesFromUrls(urls));
  emit("update:textValue", value);
};

const applySelection = (selected: ProductImage[]) => {
  const normalized = selected.map((item, index) => ({
    ...item,
    is_primary: index === 0,
    sort_order: index
  }));
  emit("update:modelValue", normalized);
  inputValue.value = joinForDisplay(normalized);
  emit("update:textValue", inputValue.value);
};

const loadFolders = async () => {
  folderLoading.value = true;
  folderError.value = "";
  try {
    const response = await $fetch<{ items: FolderOption[] }>("/api/media/folders", {
      query: {
        kind: "image",
        category: folderCategory.value === "all" ? undefined : folderCategory.value
      }
    });
    folderOptions.value = response.items || [];
  } catch (error) {
    const err = error as Error;
    folderError.value = err.message || "Failed to load folders.";
  } finally {
    folderLoading.value = false;
  }
};

const applyFolder = async () => {
  if (!folderName.value) return;
  folderLoading.value = true;
  folderError.value = "";
  try {
    const collected: MediaAsset[] = [];
    let offset = 0;
    let total = 0;
    const limit = 200;
    do {
      const response = await $fetch<{ items: MediaAsset[]; total: number; limit: number }>(
        "/api/media/list",
        {
          query: {
            kind: "image",
            category: folderCategory.value === "all" ? "all" : folderCategory.value,
            folder: folderName.value,
            sort: "oldest",
            limit,
            offset
          }
        }
      );
      collected.push(...(response.items || []));
      total = response.total || collected.length;
      offset += response.limit || limit;
    } while (collected.length < total && collected.length < 500);

    const signedUrlRegex = /(object\/sign|token=|X-Amz-Signature)/i;
    const next = collected
      .map((asset) => ({
        asset_id: asset.id,
        url: asset.public_url || asset.external_url || "",
        alt: asset.alt || asset.label || "",
        is_primary: false,
        sort_order: 0
      }))
      .filter((item) => item.url && !signedUrlRegex.test(item.url));

    if (!next.length) {
      folderError.value = "No public images found in this folder.";
      return;
    }

    applySelection(
      next.map((item, index) => ({
        ...item,
        is_primary: index === 0,
        sort_order: index
      }))
    );
  } catch (error) {
    const err = error as Error;
    folderError.value = err.message || "Failed to load folder images.";
  } finally {
    folderLoading.value = false;
  }
};

const removeImage = (index: number) => {
  const next = [...props.modelValue];
  next.splice(index, 1);
  if (next.length) {
    next[0] = { ...next[0], is_primary: true };
  }
  emit(
    "update:modelValue",
    next.map((item, idx) => ({ ...item, sort_order: idx }))
  );
};

const reorderImages = (from: number, to: number) => {
  const next = [...props.modelValue];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  emit(
    "update:modelValue",
    next.map((item, idx) => ({ ...item, is_primary: idx === 0, sort_order: idx }))
  );
};

const setFeatured = (index: number) => {
  if (!props.modelValue.length) return;
  const next = [...props.modelValue];
  const [chosen] = next.splice(index, 1);
  const reordered = [
    { ...chosen, is_primary: true },
    ...next.map((item) => ({ ...item, is_primary: false }))
  ];
  emit(
    "update:modelValue",
    reordered.map((item, idx) => ({ ...item, sort_order: idx }))
  );
};

const makeFirstFeatured = () => {
  if (!props.modelValue.length) return;
  emit(
    "update:modelValue",
    props.modelValue.map((item, idx) => ({
      ...item,
      is_primary: idx === 0,
      sort_order: idx
    }))
  );
};

const signedUrlRegex = /(object\/sign|token=|X-Amz-Signature)/i;

const duplicateUrls = computed(() => {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  for (const item of props.modelValue) {
    if (seen.has(item.url)) duplicates.push(item.url);
    seen.add(item.url);
  }
  return duplicates;
});

const signedUrls = computed(() =>
  props.modelValue.filter((item) => signedUrlRegex.test(item.url))
);

const hasWarnings = computed(() => duplicateUrls.value.length || signedUrls.value.length);

watch(
  () => props.modelValue,
  () => {
    syncTextFromModel();
  },
  { deep: true }
);

watch(
  () => props.textValue,
  (value) => {
    if (typeof value !== "string") return;
    if (value === inputValue.value) return;
    inputValue.value = value;
    emit("update:modelValue", buildImagesFromUrls(parseImagesField(value)));
  }
);

watch(folderCategory, () => {
  folderName.value = "";
  loadFolders();
});

onMounted(() => {
  loadFolders();
});

const selectedFolder = computed(() => {
  return folderOptions.value.find((folder) => folder.name === folderName.value) || null;
});
</script>
