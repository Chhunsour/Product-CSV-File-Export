<template>
  <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/50 px-4 py-3">
    <div class="text-xs text-slate-400">
      Selected
      <span class="text-slate-100">{{ count }}</span>
      image{{ count === 1 ? "" : "s" }}
    </div>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="rounded-full border border-slate-700/60 px-3 py-1 text-xs text-slate-300"
        @click="$emit('clear')"
      >
        Clear
      </button>
      <button
        type="button"
        class="rounded-full border border-slate-700/60 px-3 py-1 text-xs text-slate-300"
        @click="$emit('makeFeatured')"
      >
        Make first featured
      </button>
      <button
        type="button"
        class="rounded-full bg-brand-500 px-4 py-1 text-xs font-semibold text-white"
        @click="$emit('confirm')"
      >
        Use selected
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count: number;
}>();

defineEmits<{
  (e: "clear"): void;
  (e: "makeFeatured"): void;
  (e: "confirm"): void;
}>();
</script>
