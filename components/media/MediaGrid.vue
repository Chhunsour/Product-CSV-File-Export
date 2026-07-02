<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <article
      v-for="item in items"
      :key="item.id"
      class="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/40"
      :class="isSelected(item.id) ? 'ring-2 ring-brand-500/60' : ''"
    >
      <button
        type="button"
        class="absolute right-3 top-3 z-10 rounded-full border border-slate-700/60 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-200"
        @click.stop="$emit('toggle', item)"
      >
        {{ isSelected(item.id) ? 'Selected' : 'Select' }}
      </button>
      <div class="aspect-[4/3] w-full bg-slate-900/60">
        <img
          v-if="item.previewUrl"
          :src="item.previewUrl"
          :alt="item.alt || item.label || item.fileName"
          class="h-full w-full object-cover"
          loading="lazy"
        />
        <div v-else class="flex h-full items-center justify-center text-xs text-slate-500">
          No preview
        </div>
      </div>
      <div class="space-y-1 p-3">
        <p class="truncate text-sm font-semibold text-slate-100">
          {{ item.label || item.fileName }}
        </p>
        <p class="truncate text-xs text-slate-400">{{ item.fileName }}</p>
        <p class="truncate text-[11px] text-slate-500">{{ item.displayUrl }}</p>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
type MediaCard = {
  id: string;
  previewUrl?: string;
  displayUrl: string;
  fileName: string;
  alt?: string | null;
  label?: string | null;
};

const props = defineProps<{
  items: MediaCard[];
  selectedIds: string[];
}>();

defineEmits<{
  (e: "toggle", item: MediaCard): void;
}>();

const isSelected = (id: string) => props.selectedIds.includes(id);
</script>
