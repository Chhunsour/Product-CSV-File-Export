<template>
  <span :class="classes" class="rounded-full px-3 py-1 text-xs font-semibold">
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import type { ItemStatus } from "~/types/db";

const props = defineProps<{ status: ItemStatus }>();

const classes = computed(() => {
  switch (props.status) {
    case "published":
      return "bg-emerald-500/20 text-emerald-200";
    case "draft":
      return "bg-amber-500/20 text-amber-200";
    default:
      return "bg-slate-500/20 text-slate-200";
  }
});

const statusLabel = computed(() => {
  switch (props.status) {
    case "published":
      return "Published";
    case "draft":
      return "Draft";
    default:
      return "Private";
  }
});
</script>
