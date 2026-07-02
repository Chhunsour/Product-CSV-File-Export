<template>
  <div class="space-y-2">
    <div
      v-for="(item, index) in items"
      :key="`${item.asset_id || item.url}-${index}`"
      class="group flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3"
      :class="compact ? 'py-2' : ''"
      draggable="true"
      @dragstart="onDragStart($event, index)"
      @dragover.prevent
      @drop="onDrop(index)"
    >
      <div class="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-800/60">
        <img
          v-if="item.url"
          :src="item.url"
          :alt="item.alt || 'Selected image'"
          class="h-full w-full object-cover"
          loading="lazy"
        />
        <div v-else class="flex h-full w-full items-center justify-center text-[10px] text-slate-500">
          No image
        </div>
        <span
          v-if="item.is_primary"
          class="absolute left-1 top-1 rounded-full bg-brand-500/80 px-2 py-0.5 text-[9px] font-semibold text-white"
        >
          Featured
        </span>
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-xs font-semibold text-slate-100">
          {{ item.alt || "Image" }}
        </p>
        <p class="truncate text-[11px] text-slate-500">{{ item.url }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-full border border-slate-700/60 px-2 py-1 text-[11px] text-slate-300"
          @click="$emit('set-featured', index)"
        >
          ★
        </button>
        <button
          type="button"
          class="rounded-full border border-rose-500/40 px-2 py-1 text-[11px] text-rose-200"
          @click="$emit('remove', index)"
        >
          Remove
        </button>
      </div>
    </div>

    <p v-if="!items.length" class="rounded-2xl border border-dashed border-slate-800/60 p-4 text-xs text-slate-500">
      No images selected yet.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ProductImage } from "~/types/db";

defineProps<{
  items: ProductImage[];
  compact?: boolean;
}>();

const emit = defineEmits<{
  (e: "remove", index: number): void;
  (e: "reorder", from: number, to: number): void;
  (e: "set-featured", index: number): void;
}>();

const dragIndex = ref<number | null>(null);

const onDragStart = (event: DragEvent, index: number) => {
  dragIndex.value = index;
  event.dataTransfer?.setData("text/plain", String(index));
};

const onDrop = (index: number) => {
  if (dragIndex.value === null) return;
  if (dragIndex.value !== index) {
    emit("reorder", dragIndex.value, index);
  }
  dragIndex.value = null;
};
</script>
