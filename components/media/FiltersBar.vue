<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative flex-1 min-w-[220px]">
        <input
          :value="search"
          type="search"
          class="w-full rounded-xl border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          placeholder="Search images, labels, alt text..."
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <select
        :value="source"
        class="rounded-xl border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-xs text-slate-100"
        @change="$emit('update:source', ($event.target as HTMLSelectElement).value)"
      >
        <option value="all">All sources</option>
        <option value="stored">Stored</option>
        <option value="linked">Linked</option>
      </select>
      <select
        :value="format"
        class="rounded-xl border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-xs text-slate-100"
        @change="$emit('update:format', ($event.target as HTMLSelectElement).value)"
      >
        <option value="all">All formats</option>
        <option value="webp">WebP</option>
        <option value="jpg">JPG</option>
        <option value="png">PNG</option>
      </select>
      <select
        :value="sort"
        class="rounded-xl border border-slate-700/60 bg-slate-900/50 px-3 py-2 text-xs text-slate-100"
        @change="$emit('update:sort', ($event.target as HTMLSelectElement).value)"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="size">By size</option>
      </select>
      <div class="ml-auto flex items-center gap-1 rounded-full bg-slate-900/60 p-1">
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs"
          :class="viewMode === 'grid' ? 'bg-brand-500/20 text-brand-200' : 'text-slate-400'"
          @click="$emit('update:viewMode', 'grid')"
        >
          Grid
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1 text-xs"
          :class="viewMode === 'list' ? 'bg-brand-500/20 text-brand-200' : 'text-slate-400'"
          @click="$emit('update:viewMode', 'list')"
        >
          List
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="rounded-full border border-slate-700/60 px-3 py-1 text-xs text-slate-400"
        :class="activeCategory === '' ? 'bg-brand-500/20 text-brand-200' : ''"
        @click="$emit('update:category', '')"
      >
        All
      </button>
      <button
        v-for="category in categories"
        :key="category.key"
        type="button"
        class="rounded-full border border-slate-700/60 px-3 py-1 text-xs"
        :class="category.key === activeCategory ? 'bg-brand-500/20 text-brand-200' : 'text-slate-400'"
        @click="$emit('update:category', category.key)"
      >
        {{ category.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
type CategoryOption = { key: string; label: string };

defineProps<{
  search: string;
  source: string;
  format: string;
  sort: string;
  viewMode: "grid" | "list";
  activeCategory: string;
  categories: CategoryOption[];
}>();

defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:source", value: string): void;
  (e: "update:format", value: string): void;
  (e: "update:sort", value: string): void;
  (e: "update:viewMode", value: "grid" | "list"): void;
  (e: "update:category", value: string): void;
}>();
</script>
