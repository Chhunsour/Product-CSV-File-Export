<template>
  <section class="page-shell page-item">
    <div class="page-surface">
      <div v-if="loading" class="panel p-6 text-sm text-slate-400">
        Loading item...
      </div>

      <div v-else-if="errorMessage" class="alert alert-error">
        {{ errorMessage }}
      </div>

      <div v-else-if="item" class="grid gap-8 lg:grid-cols-[2fr,1fr] fade-up">
        <section class="panel space-y-6 p-6">
          <div class="space-y-2">
            <h1 class="text-3xl font-semibold text-slate-100">{{ item.title }}</h1>
            <p class="text-base text-slate-300">{{ item.excerpt }}</p>
            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <StatusBadge :status="item.status" />
              <span v-if="item.featured" class="font-semibold text-brand-600">Featured</span>
              <span>Updated {{ new Date(item.updated_at).toLocaleString() }}</span>
            </div>
          </div>

          <div
            v-if="renderedContent"
            class="prose prose-invert max-w-none"
            v-html="renderedContent"
          ></div>
          <p v-else class="text-sm text-slate-400">No long description provided.</p>
        </section>

        <aside class="space-y-6">
          <div class="card p-6">
            <h2 class="text-sm font-semibold text-slate-200">Quick facts</h2>
            <dl class="mt-4 space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <dt class="text-slate-400">SKU</dt>
                <dd class="text-slate-100">{{ item.sku || "—" }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-slate-400">Price</dt>
                <dd class="text-slate-100">{{ displayPrice }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-slate-400">Stock</dt>
                <dd class="text-slate-100">{{ stockLabel }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-slate-400">Type</dt>
                <dd class="text-slate-100">{{ item.product_type || "simple" }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-slate-400">Visibility</dt>
                <dd class="text-slate-100">{{ item.visibility || "default" }}</dd>
              </div>
            </dl>
          </div>
          <div class="card p-6">
            <h2 class="text-sm font-semibold text-slate-100">Attachments</h2>
            <div class="mt-4 space-y-4">
              <div v-if="linkAttachments.length">
                <h3 class="text-xs font-semibold uppercase text-slate-400">Links</h3>
                <ul class="mt-2 space-y-2">
                  <li v-for="link in linkAttachments" :key="link.id" class="text-sm">
                    <a
                      :href="link.url"
                      class="text-brand-400 hover:text-brand-300"
                      target="_blank"
                      rel="noopener"
                    >
                      {{ link.label || link.url }}
                    </a>
                  </li>
                </ul>
              </div>

              <div v-if="fileAttachments.length">
                <h3 class="text-xs font-semibold uppercase text-slate-400">Files</h3>
                <ul class="mt-2 space-y-2">
                  <li v-for="file in fileAttachments" :key="file.id" class="flex items-center justify-between text-sm">
                    <span class="text-slate-300">{{ file.label || file.url }}</span>
                    <a
                      v-if="signedUrls[file.id]"
                      :href="signedUrls[file.id]"
                      class="text-brand-400 hover:text-brand-300"
                      target="_blank"
                      rel="noopener"
                    >
                      Open
                    </a>
                  </li>
                </ul>
              </div>

              <p v-if="!linkAttachments.length && !fileAttachments.length" class="text-sm text-slate-400">
                No attachments yet.
              </p>
            </div>
          </div>

          <div v-if="relatedItems.length" class="card p-6">
            <h2 class="text-sm font-semibold text-slate-100">Related items</h2>
            <ul class="mt-3 space-y-2">
              <li v-for="related in relatedItems" :key="related.id" class="text-sm">
                <NuxtLink :to="`/item/${related.slug}`" class="text-brand-400 hover:text-brand-300">
                  {{ related.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Attachment, WorkspaceItem } from "~/types/db";

const route = useRoute();
const { $md } = useNuxtApp();
const { getItemBySlug } = useItems();
const { listForItem, getSignedUrl } = useAttachments();
const { listRelatedItems } = useRelations();

const item = ref<WorkspaceItem | null>(null);
const attachments = ref<Attachment[]>([]);
const relatedItems = ref<WorkspaceItem[]>([]);
const signedUrls = ref<Record<string, string>>({});
const loading = ref(false);
const errorMessage = ref("");

const linkAttachments = computed(() =>
  attachments.value.filter((attachment) => attachment.type === "link")
);

const fileAttachments = computed(() =>
  attachments.value.filter((attachment) => attachment.type === "file")
);

const renderedContent = computed(() =>
  item.value?.content_md ? $md.render(item.value.content_md) : ""
);

const displayPrice = computed(() => {
  if (!item.value) return "—";
  const salePrice = item.value.sale_price?.trim();
  if (salePrice) return `$${salePrice}`;
  const regularPrice = item.value.regular_price?.trim();
  if (regularPrice) return `$${regularPrice}`;
  return "—";
});

const stockLabel = computed(() => {
  if (!item.value) return "—";
  if (item.value.stock_status?.trim()) return item.value.stock_status;
  if (item.value.stock?.trim()) return item.value.stock;
  return "—";
});

const loadItem = async () => {
  const slug = route.params.slug as string;
  loading.value = true;
  errorMessage.value = "";

  try {
    item.value = await getItemBySlug(slug);
    attachments.value = await listForItem(item.value.id);
    relatedItems.value = await listRelatedItems(item.value.id);

    const urls: Record<string, string> = {};
    for (const attachment of attachments.value) {
      if (attachment.type === "file") {
        urls[attachment.id] = await getSignedUrl(attachment.url);
      }
    }
    signedUrls.value = urls;
  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || "Failed to load item.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadItem();
});

watch(
  () => route.params.slug,
  () => {
    loadItem();
  }
);
</script>
