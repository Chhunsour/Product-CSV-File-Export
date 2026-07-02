<template>
  <section class="showcase-shell">
    <span class="showcase-aura aura-left" aria-hidden="true"></span>
    <span class="showcase-aura aura-right" aria-hidden="true"></span>

    <div class="showcase-frame">
      <section class="hero-panel">
        <div class="hero-copy">
          <p class="hero-eyebrow">CSV Commerce Atelier</p>
          <h1 class="hero-title">
            Build a storefront feel before anyone opens the spreadsheet.
          </h1>
          <p class="hero-body">
            Denvor turns raw catalog data into a sharper visual story, with product media,
            pricing coverage, and export tools stitched into one deliberate workspace.
          </p>

          <div class="hero-actions">
            <NuxtLink to="/admin" class="action-btn primary">
              Open catalog
            </NuxtLink>
            <button
              type="button"
              class="action-btn secondary"
              :disabled="!items.length || exporting"
              @click="handleQuickExport"
            >
              {{ exporting ? "Exporting..." : "Export snapshot" }}
            </button>
          </div>

          <div class="hero-footnote">
            <span class="hero-pulse" aria-hidden="true"></span>
            <span>Last sync {{ latestUpdatedLabel }}</span>
            <span class="hero-separator" aria-hidden="true"></span>
            <span>{{ totalCountLabel }} items in the workspace</span>
          </div>

          <div class="hero-stats">
            <article
              v-for="metric in heroStats"
              :key="metric.label"
              class="hero-stat-card"
            >
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
              <small>{{ metric.detail }}</small>
            </article>
          </div>
        </div>

        <div class="hero-stage">
          <NuxtLink :to="heroFrame.href" class="stage-main-card">
            <img
              :src="heroFrame.image"
              :alt="heroFrame.title"
              class="stage-image"
              loading="eager"
              decoding="async"
            />
            <div class="stage-overlay">
              <p class="stage-kicker">{{ heroFrame.eyebrow }}</p>
              <h2>{{ heroFrame.title }}</h2>
              <p class="stage-copy">{{ heroFrame.subtitle }}</p>
              <div class="stage-meta">
                <span class="stage-pill">{{ heroFrame.badge }}</span>
                <span>{{ heroFrame.meta }}</span>
              </div>
            </div>
          </NuxtLink>

          <div class="stage-side-stack">
            <NuxtLink
              v-for="frame in secondaryFrames"
              :key="frame.id"
              :to="frame.href"
              class="stage-side-card"
            >
              <img
                :src="frame.image"
                :alt="frame.title"
                class="stage-image"
                loading="lazy"
                decoding="async"
              />
              <div class="stage-side-overlay">
                <p>{{ frame.eyebrow }}</p>
                <strong>{{ frame.title }}</strong>
                <span>{{ frame.meta }}</span>
              </div>
            </NuxtLink>
          </div>

          <div class="stage-floating-card">
            <p class="floating-label">Live launch score</p>
            <div class="floating-value">{{ readinessPercent }}%</div>
            <div class="floating-metrics">
              <div>
                <span>Ready</span>
                <strong>{{ readyCountLabel }}</strong>
              </div>
              <div>
                <span>Missing media</span>
                <strong>{{ missingImageCountLabel }}</strong>
              </div>
            </div>
            <NuxtLink to="/media/images" class="floating-link">
              Open image vault
            </NuxtLink>
          </div>
        </div>
      </section>

      <section class="section-block process-grid">
        <article
          v-for="card in processCards"
          :key="card.step"
          class="process-card"
        >
          <span class="process-step">{{ card.step }}</span>
          <h2>{{ card.title }}</h2>
          <p>{{ card.copy }}</p>
        </article>
      </section>

      <section class="section-block command-grid">
        <div class="command-copy">
          <p class="section-eyebrow">Visual-first control</p>
          <h2 class="section-title">
            Make the workspace feel editorial while the exports stay brutally practical.
          </h2>
          <p class="section-body">
            The front page now carries the product imagery, the quality signals, and the
            operational actions together. You can review live coverage, search records, and
            export missing data without dropping into a flat dashboard.
          </p>

          <div class="coverage-stack">
            <article
              v-for="band in coverageBands"
              :key="band.label"
              class="coverage-card"
            >
              <div class="coverage-head">
                <span>{{ band.label }}</span>
                <strong>{{ band.value }}%</strong>
              </div>
              <div class="coverage-bar">
                <span :style="{ width: `${band.value}%`, background: band.gradient }"></span>
              </div>
              <small>{{ band.note }}</small>
            </article>
          </div>

          <div class="command-actions">
            <button
              type="button"
              class="action-btn tertiary"
              :disabled="!missingAnyItems.length"
              @click="handleExportMissing"
            >
              Export missing data
            </button>
            <NuxtLink to="/media/videos" class="text-link">
              Browse video vault
            </NuxtLink>
          </div>
        </div>

        <div class="command-panel">
          <div class="command-panel-head">
            <p>Search the collection</p>
            <span>{{ totalCountLabel }} records indexed</span>
          </div>

          <label class="command-search">
            <span class="sr-only">Search the catalog</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search title, SKU, slug, or category"
            />
          </label>

          <div class="command-results">
            <div v-if="loadingItems" class="command-empty">
              Loading catalog...
            </div>
            <div v-else-if="itemsError" class="command-empty">
              {{ itemsError }}
            </div>
            <template v-else-if="searchQuery.trim()">
              <div v-if="searchResults.length" class="listing-grid">
                <NuxtLink
                  v-for="item in searchResults"
                  :key="item.id"
                  :to="`/admin/edit/${item.id}`"
                  class="listing-card"
                >
                  <div class="listing-top">
                    <p>{{ item.title }}</p>
                    <span :class="['listing-status', `listing-status-${item.status}`]">
                      {{ statusText(item.status) }}
                    </span>
                  </div>
                  <div class="listing-meta">
                    <span>SKU {{ item.sku || "TBD" }}</span>
                    <span>{{ formatPrice(item) }}</span>
                  </div>
                </NuxtLink>
              </div>
              <div v-else class="command-empty">
                No matches yet. Try a SKU, slug, or category.
              </div>
            </template>
            <template v-else>
              <div v-if="recentItems.length" class="listing-grid">
                <NuxtLink
                  v-for="item in recentItems"
                  :key="item.id"
                  :to="`/admin/edit/${item.id}`"
                  class="listing-card"
                >
                  <div class="listing-top">
                    <p>{{ item.title }}</p>
                    <span :class="['listing-status', `listing-status-${item.status}`]">
                      {{ statusText(item.status) }}
                    </span>
                  </div>
                  <div class="listing-meta">
                    <span>Updated {{ formatDate(item.updated_at) }}</span>
                    <span>{{ formatPrice(item) }}</span>
                  </div>
                </NuxtLink>
              </div>
              <div v-else class="command-empty">
                No items yet. Start by creating your first product record.
              </div>
            </template>
          </div>
        </div>
      </section>

      <section class="section-block gallery-section">
        <div class="gallery-head">
          <p class="section-eyebrow">Image-backed storytelling</p>
          <h2 class="section-title">A homepage with actual visual weight.</h2>
          <p class="section-body">
            These tiles pull from the catalog when real images exist and fall back to curated
            visuals when they do not, so the page always feels alive.
          </p>
        </div>

        <div class="gallery-mosaic">
          <NuxtLink
            v-for="frame in mosaicFrames"
            :key="frame.id"
            :to="frame.href"
            class="mosaic-card"
          >
            <img
              :src="frame.image"
              :alt="frame.title"
              class="mosaic-image"
              loading="lazy"
              decoding="async"
            />
            <div class="mosaic-overlay">
              <p>{{ frame.eyebrow }}</p>
              <strong>{{ frame.title }}</strong>
              <span>{{ frame.meta }}</span>
            </div>
          </NuxtLink>
        </div>
      </section>

      <section class="section-block closing-grid">
        <div class="recent-panel">
          <div class="recent-panel-head">
            <p class="section-eyebrow">Recent movement</p>
            <h2 class="section-title">Fresh edits stay visible.</h2>
          </div>

          <div v-if="recentItems.length" class="recent-list">
            <NuxtLink
              v-for="item in recentItems"
              :key="item.id"
              :to="`/admin/edit/${item.id}`"
              class="recent-row"
            >
              <div>
                <strong>{{ item.title }}</strong>
                <span>{{ item.sku || "SKU pending" }}</span>
              </div>
              <div class="recent-row-meta">
                <span>{{ formatDate(item.updated_at) }}</span>
                <span>{{ formatPrice(item) }}</span>
              </div>
            </NuxtLink>
          </div>
          <div v-else class="command-empty">
            Add products to see updates and image-backed highlights here.
          </div>
        </div>

        <div class="cta-panel">
          <p class="section-eyebrow">Launch cleaner</p>
          <h2 class="section-title">
            Keep the interface polished without losing the CSV workflow underneath it.
          </h2>
          <p class="section-body">
            Move from data cleanup to visual review to export in a single pass. The page stays
            useful as an operations surface, but it now reads like a real brand environment.
          </p>

          <div class="cta-metric-row">
            <article>
              <span>Published</span>
              <strong>{{ publishedCountLabel }}</strong>
            </article>
            <article>
              <span>Missing fields</span>
              <strong>{{ missingAnyCountLabel }}</strong>
            </article>
          </div>

          <div class="cta-actions">
            <NuxtLink to="/admin/new" class="action-btn primary">
              Create new item
            </NuxtLink>
            <NuxtLink to="/media/images" class="action-btn secondary subtle">
              Curate imagery
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { downloadCsv, toCsv } from "~/utils/csv";
import { parseImagesField } from "~/utils/parseImagesField";
import type { WorkspaceItem, ItemStatus } from "~/types/db";

type ShowcaseFrame = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  eyebrow: string;
  meta: string;
  href: string;
  badge: string;
};

definePageMeta({
  middleware: "lock-home"
});

useHead({
  title: "Denvor Workspace",
  meta: [
    {
      name: "description",
      content: "An image-first workspace for shaping CSV product catalogs into polished commerce launches."
    }
  ]
});

const user = useSupabaseUser();
const runtimeConfig = useRuntimeConfig();
const devOwnerId = computed(() => runtimeConfig.public.devOwnerId || "");
const { listItems } = useItems();

const items = ref<WorkspaceItem[]>([]);
const loadingItems = ref(false);
const itemsError = ref("");
const searchQuery = ref("");
const exporting = ref(false);

const processCards = [
  {
    step: "01",
    title: "Shape the feed",
    copy: "Pull CSV rows into a cleaner workspace, normalize the structure, and make the catalog easier to judge at a glance."
  },
  {
    step: "02",
    title: "Curate the imagery",
    copy: "Pair products with stronger photography so the storefront feels considered instead of purely operational."
  },
  {
    step: "03",
    title: "Export with confidence",
    copy: "Use live quality signals to ship snapshots or isolate incomplete items before they slow down the next release."
  }
];

const fallbackFrames: ShowcaseFrame[] = [
  {
    id: "fallback-1",
    title: "Campaign-ready product sets",
    subtitle: "A warmer, image-led presentation that makes a data-heavy catalog feel intentional.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80",
    eyebrow: "Editorial retail",
    meta: "Visual direction",
    href: "/media/images",
    badge: "Curated"
  },
  {
    id: "fallback-2",
    title: "Studio detail views",
    subtitle: "Rich crops, soft lighting, and tighter hierarchy keep the interface from reading like a spreadsheet wrapper.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Studio frame",
    meta: "Image-first",
    href: "/media/images",
    badge: "Feature"
  },
  {
    id: "fallback-3",
    title: "Launch-day merchandising",
    subtitle: "Use the homepage to sell the quality of the catalog before anyone reaches the admin views.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Launch board",
    meta: "Merchandising",
    href: "/admin",
    badge: "Featured"
  },
  {
    id: "fallback-4",
    title: "Quiet luxury layouts",
    subtitle: "A brighter surface with controlled color gives the workspace more confidence.",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Premium styling",
    meta: "Design system",
    href: "/media/images",
    badge: "Lookbook"
  },
  {
    id: "fallback-5",
    title: "Catalog moments worth zooming into",
    subtitle: "Image cards keep the home screen feeling active even before you search or export.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Hero crop",
    meta: "Preview mode",
    href: "/admin",
    badge: "Spotlight"
  },
  {
    id: "fallback-6",
    title: "Visual rhythm across the page",
    subtitle: "Mosaic layouts create momentum and make the experience feel less like a utility dashboard.",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Layout study",
    meta: "Brand surface",
    href: "/media/videos",
    badge: "Gallery"
  }
];

const formatCount = (value: number) => new Intl.NumberFormat().format(value);

const stripCopy = (value: string | null | undefined) =>
  (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (value: string, max = 110) =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}...` : value;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

const formatPrice = (item: WorkspaceItem) => {
  const sale = item.sale_price?.trim();
  if (sale) return `$${sale}`;
  const regular = item.regular_price?.trim();
  if (regular) return `$${regular}`;
  return "Pricing TBD";
};

const statusText = (status: ItemStatus) =>
  status === "published" ? "Published" : status === "private" ? "Private" : "Draft";

const firstImageForItem = (item: WorkspaceItem) =>
  parseImagesField(item.images)[0] ||
  item.rank_math_facebook_image?.trim() ||
  item.rank_math_twitter_image?.trim() ||
  "";

const itemSummary = (item: WorkspaceItem) => {
  const bestCopy =
    stripCopy(item.short_description) ||
    stripCopy(item.excerpt) ||
    stripCopy(item.content_md) ||
    "Metadata, pricing, and media aligned for a stronger catalog release.";
  return truncate(bestCopy, 120);
};

const sortedItems = computed(() =>
  [...items.value].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )
);

const totalCount = computed(() => items.value.length);
const publishedCount = computed(() => items.value.filter((item) => item.status === "published").length);
const missingSkuItems = computed(() => items.value.filter((item) => !item.sku?.trim()));
const missingPriceItems = computed(() =>
  items.value.filter((item) => !item.sale_price?.trim() && !item.regular_price?.trim())
);
const missingImageItems = computed(() => items.value.filter((item) => !item.images?.trim()));
const missingAnyItems = computed(() =>
  items.value.filter(
    (item) =>
      !item.sku?.trim() ||
      (!item.sale_price?.trim() && !item.regular_price?.trim()) ||
      !item.images?.trim()
  )
);
const readyCount = computed(() => Math.max(0, totalCount.value - missingAnyItems.value.length));
const readinessPercent = computed(() => {
  if (!totalCount.value) return 0;
  return Math.round((readyCount.value / totalCount.value) * 100);
});
const imageCoverage = computed(() => {
  if (!totalCount.value) return 0;
  return Math.round(((totalCount.value - missingImageItems.value.length) / totalCount.value) * 100);
});
const priceCoverage = computed(() => {
  if (!totalCount.value) return 0;
  return Math.round(((totalCount.value - missingPriceItems.value.length) / totalCount.value) * 100);
});
const skuCoverage = computed(() => {
  if (!totalCount.value) return 0;
  return Math.round(((totalCount.value - missingSkuItems.value.length) / totalCount.value) * 100);
});
const latestUpdatedLabel = computed(() =>
  sortedItems.value[0] ? formatDate(sortedItems.value[0].updated_at) : "Awaiting sync"
);

const liveFrames = computed<ShowcaseFrame[]>(() =>
  sortedItems.value
    .map((item) => {
      const image = firstImageForItem(item);
      if (!image) return null;

      return {
        id: item.id,
        title: item.title,
        subtitle: itemSummary(item),
        image,
        eyebrow:
          item.categories?.split(",").map((value) => value.trim()).find(Boolean) ||
          item.product_type?.trim() ||
          "Catalog story",
        meta: formatPrice(item),
        href: `/admin/edit/${item.id}`,
        badge: statusText(item.status)
      };
    })
    .filter((frame): frame is ShowcaseFrame => Boolean(frame))
);

const spotlightFrames = computed(() => [...liveFrames.value.slice(0, 3), ...fallbackFrames].slice(0, 3));
const heroFrame = computed(() => spotlightFrames.value[0]);
const secondaryFrames = computed(() => spotlightFrames.value.slice(1, 3));
const mosaicFrames = computed(() => [...liveFrames.value, ...fallbackFrames].slice(0, 6));
const recentItems = computed(() => sortedItems.value.slice(0, 4));

const heroStats = computed(() => [
  {
    label: "Catalog volume",
    value: totalCountLabel.value,
    detail: "records currently indexed"
  },
  {
    label: "Launch ready",
    value: `${readinessPercent.value}%`,
    detail: `${readyCountLabel.value} products ready to export`
  },
  {
    label: "Visual coverage",
    value: `${imageCoverage.value}%`,
    detail: `${missingImageCountLabel.value} records still need imagery`
  },
  {
    label: "Last refresh",
    value: latestUpdatedLabel.value,
    detail: "most recent product update"
  }
]);

const coverageBands = computed(() => [
  {
    label: "Image coverage",
    value: imageCoverage.value,
    note: `${missingImageCountLabel.value} items are still missing photography`,
    gradient: "linear-gradient(90deg, #e87052 0%, #f3a56c 100%)"
  },
  {
    label: "Price coverage",
    value: priceCoverage.value,
    note: `${formatCount(missingPriceItems.value.length)} items still need pricing`,
    gradient: "linear-gradient(90deg, #146c73 0%, #27b0a7 100%)"
  },
  {
    label: "SKU coverage",
    value: skuCoverage.value,
    note: `${formatCount(missingSkuItems.value.length)} items still need SKU cleanup`,
    gradient: "linear-gradient(90deg, #2c4f80 0%, #6f9bff 100%)"
  }
]);

const searchResults = computed(() => {
  const term = searchQuery.value.trim().toLowerCase();
  if (!term) return [];

  return sortedItems.value
    .filter((item) => {
      return [
        item.title,
        item.sku,
        item.slug,
        item.categories,
        item.tags,
        item.product_type
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    })
    .slice(0, 6);
});

const totalCountLabel = computed(() => formatCount(totalCount.value));
const readyCountLabel = computed(() => formatCount(readyCount.value));
const publishedCountLabel = computed(() => formatCount(publishedCount.value));
const missingImageCountLabel = computed(() => formatCount(missingImageItems.value.length));
const missingAnyCountLabel = computed(() => formatCount(missingAnyItems.value.length));

const handleQuickExport = () => {
  if (!items.value.length) return;

  exporting.value = true;
  const columns = ["title", "slug", "status", "sku", "regular_price", "sale_price", "updated_at"];
  const rows = sortedItems.value.slice(0, 40).map((item) => ({
    title: item.title,
    slug: item.slug,
    status: item.status,
    sku: item.sku,
    regular_price: item.regular_price,
    sale_price: item.sale_price,
    updated_at: item.updated_at
  }));
  const csv = toCsv(columns, rows);
  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, `workspace-snapshot-${stamp}.csv`);
  exporting.value = false;
};

const handleExportMissing = () => {
  if (!missingAnyItems.value.length) return;

  const columns = [
    "title",
    "slug",
    "status",
    "sku",
    "regular_price",
    "sale_price",
    "images",
    "updated_at"
  ];
  const rows = missingAnyItems.value.map((item) => ({
    title: item.title,
    slug: item.slug,
    status: item.status,
    sku: item.sku,
    regular_price: item.regular_price,
    sale_price: item.sale_price,
    images: item.images,
    updated_at: item.updated_at
  }));
  const csv = toCsv(columns, rows);
  const stamp = new Date().toISOString().slice(0, 10);
  downloadCsv(csv, `workspace-missing-data-${stamp}.csv`);
};

const loadItems = async () => {
  if (!(user.value?.id || devOwnerId.value)) return;

  loadingItems.value = true;
  itemsError.value = "";

  try {
    items.value = await listItems();
  } catch (error) {
    const err = error as Error;
    itemsError.value = err.message || "Unable to load catalog items.";
  } finally {
    loadingItems.value = false;
  }
};

onMounted(() => {
  loadItems();
});

watch(
  () => user.value?.id || devOwnerId.value,
  (value, previous) => {
    if (value && value !== previous) {
      loadItems();
    }
  }
);
</script>

<style scoped>
.showcase-shell {
  position: relative;
  padding: clamp(1rem, 2vw, 1.75rem);
}

.showcase-aura {
  position: absolute;
  width: 28rem;
  height: 28rem;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.24;
  pointer-events: none;
  animation: drift 12s ease-in-out infinite;
}

.aura-left {
  top: 4%;
  left: -8%;
  background: rgba(232, 112, 82, 0.55);
}

.aura-right {
  right: -10%;
  bottom: 8%;
  background: rgba(39, 176, 167, 0.4);
  animation-delay: -5s;
}

.showcase-frame {
  position: relative;
  overflow: hidden;
  border-radius: 32px;
  padding: clamp(1.1rem, 2vw, 1.8rem);
  background:
    radial-gradient(circle at top left, rgba(232, 112, 82, 0.14), transparent 28%),
    radial-gradient(circle at top right, rgba(39, 176, 167, 0.12), transparent 24%),
    linear-gradient(145deg, rgba(247, 241, 232, 0.98), rgba(255, 249, 239, 0.96) 55%, rgba(239, 228, 213, 0.96));
  border: 1px solid rgba(245, 226, 208, 0.92);
  box-shadow: 0 32px 90px -48px rgba(2, 6, 23, 0.72);
  color: #10212b;
}

.showcase-frame::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(16, 33, 43, 0.03) 1px, transparent 1px),
    linear-gradient(rgba(16, 33, 43, 0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.28), transparent 75%);
  pointer-events: none;
}

.showcase-frame > * {
  position: relative;
  z-index: 1;
}

.section-block + .section-block {
  margin-top: 1.25rem;
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
  gap: 1.35rem;
  align-items: center;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: clamp(0.4rem, 1vw, 0.8rem);
}

.hero-eyebrow,
.section-eyebrow {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(16, 33, 43, 0.58);
}

.hero-title,
.section-title {
  margin: 0;
  font-size: clamp(2.4rem, 5vw, 4.8rem);
  line-height: 0.94;
  max-width: 12ch;
}

.section-title {
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  line-height: 1;
  max-width: 14ch;
}

.hero-body,
.section-body {
  margin: 0;
  max-width: 58ch;
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(16, 33, 43, 0.74);
}

.hero-actions,
.command-actions,
.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.9rem;
  padding: 0.8rem 1.1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.action-btn.primary {
  background: linear-gradient(135deg, #10212b, #17394b);
  color: #fff8ef;
  box-shadow: 0 16px 30px -22px rgba(16, 33, 43, 0.9);
}

.action-btn.secondary,
.action-btn.tertiary {
  border-color: rgba(16, 33, 43, 0.14);
  background: rgba(255, 255, 255, 0.56);
  color: #10212b;
}

.action-btn.subtle {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 248, 239, 0.2);
  color: #fff8ef;
}

.text-link,
.floating-link {
  color: #17394b;
  font-weight: 700;
  text-decoration: none;
}

.hero-footnote {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.7rem;
  padding: 0.7rem 0.95rem;
  width: fit-content;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(16, 33, 43, 0.08);
  color: rgba(16, 33, 43, 0.76);
  font-size: 0.84rem;
  font-weight: 600;
}

.hero-pulse {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 999px;
  background: #e87052;
  box-shadow: 0 0 0 0 rgba(232, 112, 82, 0.4);
  animation: pulse 2.4s infinite;
}

.hero-separator {
  width: 0.3rem;
  height: 0.3rem;
  border-radius: 999px;
  background: rgba(16, 33, 43, 0.22);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.hero-stat-card,
.process-card,
.coverage-card,
.recent-panel {
  border-radius: 24px;
  border: 1px solid rgba(16, 33, 43, 0.08);
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(10px);
}

.hero-stat-card {
  padding: 1rem;
}

.hero-stat-card span,
.coverage-head span,
.recent-row span,
.listing-meta span,
.command-panel-head span,
.process-step {
  display: block;
  color: rgba(16, 33, 43, 0.58);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-stat-card strong {
  display: block;
  margin-top: 0.35rem;
  font-size: 1.55rem;
  line-height: 1;
}

.hero-stat-card small,
.coverage-card small,
.process-card p {
  display: block;
  margin-top: 0.45rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(16, 33, 43, 0.7);
}

.hero-stage {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(210px, 0.85fr);
  gap: 1rem;
  align-items: stretch;
}

.stage-main-card,
.stage-side-card,
.mosaic-card {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  text-decoration: none;
}

.stage-main-card {
  min-height: 37rem;
  background: #17394b;
  box-shadow: 0 28px 40px -30px rgba(16, 33, 43, 0.8);
}

.stage-side-stack {
  display: grid;
  gap: 1rem;
}

.stage-side-card {
  min-height: 18rem;
  background: #10212b;
}

.stage-image,
.mosaic-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stage-main-card::after,
.stage-side-card::after,
.mosaic-card::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(9, 19, 25, 0.74), rgba(9, 19, 25, 0.08) 55%, transparent);
}

.stage-overlay,
.stage-side-overlay,
.mosaic-overlay {
  position: absolute;
  inset: auto 0 0;
  z-index: 1;
  padding: 1.25rem;
  color: #fff8ef;
}

.stage-kicker,
.mosaic-overlay p,
.stage-side-overlay p {
  margin: 0 0 0.35rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(255, 248, 239, 0.72);
}

.stage-overlay h2,
.stage-side-overlay strong,
.mosaic-overlay strong {
  display: block;
  margin: 0;
  font-size: clamp(1.6rem, 2.4vw, 2.4rem);
  line-height: 1;
}

.stage-side-overlay strong,
.mosaic-overlay strong {
  font-size: 1.25rem;
}

.stage-copy {
  margin: 0.7rem 0 0;
  max-width: 30ch;
  color: rgba(255, 248, 239, 0.78);
  line-height: 1.55;
}

.stage-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.95rem;
  color: rgba(255, 248, 239, 0.84);
}

.stage-pill {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 248, 239, 0.18);
  font-size: 0.75rem;
  font-weight: 700;
}

.stage-side-overlay span,
.mosaic-overlay span {
  display: block;
  margin-top: 0.3rem;
  color: rgba(255, 248, 239, 0.72);
  font-size: 0.88rem;
}

.stage-floating-card {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  z-index: 2;
  width: min(18rem, 70%);
  padding: 1rem;
  border-radius: 22px;
  background: rgba(255, 248, 239, 0.9);
  border: 1px solid rgba(255, 248, 239, 0.8);
  box-shadow: 0 18px 36px -24px rgba(16, 33, 43, 0.84);
  animation: float-card 8s ease-in-out infinite;
}

.floating-label {
  margin: 0;
  color: rgba(16, 33, 43, 0.58);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.floating-value {
  margin-top: 0.45rem;
  font-size: 3rem;
  line-height: 0.9;
  font-weight: 800;
}

.floating-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1rem 0 0.8rem;
}

.floating-metrics span,
.cta-metric-row span {
  display: block;
  color: rgba(16, 33, 43, 0.58);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.floating-metrics strong,
.cta-metric-row strong {
  display: block;
  margin-top: 0.2rem;
  font-size: 1.15rem;
}

.process-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.process-card {
  padding: 1.2rem;
}

.process-card h2 {
  margin: 0.55rem 0 0;
  font-size: 1.4rem;
  line-height: 1.05;
}

.command-grid,
.closing-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.96fr) minmax(0, 1.04fr);
  gap: 1rem;
}

.command-copy,
.gallery-head,
.recent-panel-head {
  padding: clamp(0.4rem, 1vw, 0.8rem);
}

.coverage-stack {
  display: grid;
  gap: 0.8rem;
  margin-top: 1.4rem;
}

.coverage-card {
  padding: 1rem;
}

.coverage-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.coverage-head strong {
  font-size: 1.2rem;
}

.coverage-bar {
  height: 0.7rem;
  margin-top: 0.75rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(16, 33, 43, 0.08);
}

.coverage-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.command-panel,
.cta-panel {
  padding: 1.2rem;
  border-radius: 28px;
  background: linear-gradient(145deg, #10212b, #17394b 62%, #1d4f59);
  color: #fff8ef;
  box-shadow: 0 30px 54px -36px rgba(16, 33, 43, 0.9);
}

.command-panel-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
}

.command-panel-head p {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.command-panel-head span {
  color: rgba(255, 248, 239, 0.62);
}

.command-search {
  display: block;
  margin-top: 1rem;
}

.command-search input {
  width: 100%;
  border-radius: 20px;
  border: 1px solid rgba(255, 248, 239, 0.15);
  padding: 0.95rem 1rem;
  background: rgba(255, 248, 239, 0.08);
  color: #fff8ef;
}

.command-search input::placeholder {
  color: rgba(255, 248, 239, 0.5);
}

.command-results {
  margin-top: 1rem;
}

.listing-grid,
.recent-list {
  display: grid;
  gap: 0.75rem;
}

.listing-card,
.recent-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding: 0.95rem 1rem;
  border-radius: 20px;
  text-decoration: none;
  background: rgba(255, 248, 239, 0.08);
  border: 1px solid rgba(255, 248, 239, 0.1);
  color: inherit;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.listing-card:hover,
.recent-row:hover,
.mosaic-card:hover,
.stage-main-card:hover,
.stage-side-card:hover {
  transform: translateY(-2px);
}

.listing-top {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.listing-top p,
.recent-row strong {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.listing-meta,
.recent-row-meta {
  display: grid;
  gap: 0.3rem;
  justify-items: end;
  text-align: right;
}

.listing-status {
  display: inline-flex;
  width: fit-content;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.listing-status-published {
  background: rgba(77, 201, 160, 0.18);
  color: #6ee7c8;
}

.listing-status-draft {
  background: rgba(243, 165, 108, 0.18);
  color: #ffd4aa;
}

.listing-status-private {
  background: rgba(111, 155, 255, 0.18);
  color: #c7d8ff;
}

.command-empty {
  padding: 1rem;
  border-radius: 18px;
  background: rgba(255, 248, 239, 0.07);
  color: rgba(255, 248, 239, 0.72);
}

.gallery-section {
  margin-top: 1.25rem;
}

.gallery-mosaic {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.mosaic-card {
  min-height: 15rem;
  background: #17394b;
}

.mosaic-card:nth-child(1) {
  grid-column: span 7;
  min-height: 20rem;
}

.mosaic-card:nth-child(2),
.mosaic-card:nth-child(3) {
  grid-column: span 5;
}

.mosaic-card:nth-child(4),
.mosaic-card:nth-child(5),
.mosaic-card:nth-child(6) {
  grid-column: span 4;
}

.closing-grid {
  margin-top: 1.25rem;
  grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.86fr);
}

.recent-panel {
  padding: 1.2rem;
}

.recent-panel-head {
  padding: 0 0 1rem;
}

.recent-panel-head .section-title {
  max-width: 12ch;
}

.recent-row {
  background: rgba(16, 33, 43, 0.04);
  border-color: rgba(16, 33, 43, 0.08);
  color: #10212b;
}

.recent-row span {
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.88rem;
}

.cta-panel .section-eyebrow,
.cta-panel .section-body,
.cta-panel .section-title,
.cta-panel .text-link {
  color: #fff8ef;
}

.cta-panel .section-eyebrow {
  color: rgba(255, 248, 239, 0.68);
}

.cta-panel .section-body {
  color: rgba(255, 248, 239, 0.78);
  margin-top: 0.8rem;
}

.cta-metric-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
  margin: 1.3rem 0;
}

.cta-metric-row article {
  padding: 0.9rem 1rem;
  border-radius: 20px;
  background: rgba(255, 248, 239, 0.08);
  border: 1px solid rgba(255, 248, 239, 0.1);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1180px) {
  .hero-panel,
  .command-grid,
  .closing-grid {
    grid-template-columns: 1fr;
  }

  .hero-stage {
    grid-template-columns: 1fr;
  }

  .stage-side-stack {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stage-floating-card {
    position: static;
    width: 100%;
    margin-top: 1rem;
  }
}

@media (max-width: 900px) {
  .process-grid,
  .hero-stats,
  .cta-metric-row {
    grid-template-columns: 1fr;
  }

  .gallery-mosaic {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mosaic-card,
  .mosaic-card:nth-child(1),
  .mosaic-card:nth-child(2),
  .mosaic-card:nth-child(3),
  .mosaic-card:nth-child(4),
  .mosaic-card:nth-child(5),
  .mosaic-card:nth-child(6) {
    grid-column: span 1;
    min-height: 16rem;
  }
}

@media (max-width: 720px) {
  .showcase-shell {
    padding: 0.6rem;
  }

  .showcase-frame {
    border-radius: 24px;
    padding: 0.85rem;
  }

  .hero-title,
  .section-title {
    max-width: none;
  }

  .hero-footnote,
  .command-panel-head,
  .listing-card,
  .recent-row,
  .hero-actions,
  .command-actions,
  .cta-actions {
    align-items: stretch;
  }

  .command-panel-head,
  .listing-card,
  .recent-row {
    flex-direction: column;
  }

  .listing-meta,
  .recent-row-meta {
    width: 100%;
    justify-items: start;
    text-align: left;
  }

  .stage-side-stack,
  .gallery-mosaic {
    grid-template-columns: 1fr;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(232, 112, 82, 0.4);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(232, 112, 82, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(232, 112, 82, 0);
  }
}

@keyframes drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, 18px, 0);
  }
}

@keyframes float-card {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -6px, 0);
  }
}
</style>
