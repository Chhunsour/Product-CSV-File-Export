<template>
  <div class="space-y-2">
    <div
      v-for="item in items"
      :key="item.id"
      class="flex items-center gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3"
      :class="isSelected(item.id) ? 'ring-2 ring-brand-500/60' : ''"
    >
      <img
        v-if="item.previewUrl"
        :src="item.previewUrl"
        :alt="item.alt || item.label || item.fileName"
        class="h-12 w-12 rounded-xl object-cover"
        loading="lazy"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-slate-100">
          {{ item.label || item.fileName }}
        </p>
        <p class="truncate text-xs text-slate-400">{{ item.fileName }}</p>
        <p class="truncate text-[11px] text-slate-500">{{ item.displayUrl }}</p>
      </div>
      <button
        type="button"
        class="rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200"
        @click.stop="$emit('toggle', item)"
      >
        {{ isSelected(item.id) ? 'Selected' : 'Select' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
type MediaRow = {
  id: string;
  previewUrl?: string;
  displayUrl: string;
  fileName: string;
  alt?: string | null;
  label?: string | null;
};

const props = defineProps<{
  items: MediaRow[];
  selectedIds: string[];
}>();

defineEmits<{
  (e: "toggle", item: MediaRow): void;
}>();

const isSelected = (id: string) => props.selectedIds.includes(id);
</script>
