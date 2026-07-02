<template>
  <section class="page-shell page-blogs">
    <div class="page-surface blogs-surface">
      <header class="blogs-header">
        <div class="blogs-header-main">
          <p class="blogs-kicker">Blogs</p>
          <h1 class="blogs-title">Weekly Blog Ops</h1>
          <p class="blogs-subtitle">Plan posts by week, manage files, and copy WordPress packs without the mess.</p>
        </div>
        <div class="blogs-header-actions">
          <button type="button" class="btn-ghost text-xs px-3 py-1.5">
            Blog files
          </button>
          <button type="button" class="btn-primary text-xs px-3 py-1.5">
            New post
          </button>
        </div>
      </header>

      <section class="blogs-toolbar">
        <div class="blogs-week-info">
          <div class="blogs-week-pill">Week {{ currentWeek.week }}, {{ currentWeek.year }}</div>
          <div class="blogs-range">{{ formatRangeLabel(rangeStart, rangeEnd) }}</div>
        </div>
        <div class="blogs-week-nav">
          <button type="button" class="btn-ghost text-xs px-3 py-1.5" @click="shiftWeek(-1)">
            Prev week
          </button>
          <button type="button" class="btn-primary text-xs px-3 py-1.5" @click="goToThisWeek">
            This week
          </button>
          <button type="button" class="btn-ghost text-xs px-3 py-1.5" @click="shiftWeek(1)">
            Next week
          </button>
        </div>
        <div class="blogs-jump">
          <span>Jump</span>
          <input v-model.number="jumpWeek" type="number" min="1" max="53" />
          <span>/</span>
          <input v-model.number="jumpYear" type="number" min="2020" max="2100" />
          <button type="button" class="btn-ghost text-xs px-2 py-1" @click="jumpToWeek">
            Go
          </button>
        </div>
        <div class="blogs-multi">
          <div class="blogs-filter">
            <input v-model.trim="searchTerm" type="text" placeholder="Search notes" />
            <select v-model="statusFilter">
              <option value="all">All</option>
              <option value="idea">Idea</option>
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="published">Published</option>
            </select>
            <span class="blogs-filter-count">{{ filteredCount }} match</span>
          </div>
          <button type="button" class="btn-ghost text-xs px-3 py-1.5" @click="toggleMultiSelect">
            {{ multiSelect ? "Cancel selection" : "Select multiple" }}
          </button>
          <span v-if="selectedSlots.length" class="blogs-multi-pill">
            {{ selectedSlots.length }} selected
          </span>
          <button
            type="button"
            class="btn-primary text-xs px-3 py-1.5"
            :disabled="!selectedSlots.length"
            @click="exportSelected"
          >
            Export selected
          </button>
          <button type="button" class="btn-ghost text-xs px-3 py-1.5" @click="exportWeek">
            Export week
          </button>
          <button type="button" class="btn-ghost text-xs px-3 py-1.5" @click="clearWeekNotes">
            Clear week
          </button>
        </div>
      </section>

      <div class="blogs-layout">
        <section class="blogs-calendar panel">
          <div class="blogs-week-grid">
            <div class="blogs-week-grid-head">
              <div class="blogs-grid-corner">
                <span>Websites</span>
                <span class="blogs-grid-meta">Target 2 posts / week</span>
              </div>
              <div
                v-for="day in safeWeekDays"
                :key="day.toISOString()"
                :class="[
                  'blogs-grid-day',
                  isToday(day) && 'is-today',
                  isPublishDay(day) && 'is-target',
                ]"
              >
                <span class="blogs-grid-day-name">{{ formatDayLabel(day) }}</span>
                <span class="blogs-grid-day-date">{{ formatDayNumber(day) }}</span>
              </div>
            </div>

            <div class="blogs-week-grid-body">
              <div v-for="site in sites" :key="site.id" class="blogs-grid-row">
                <div class="blogs-site-cell">
                  <div class="blogs-site-name">{{ site.name }}</div>
                  <div class="blogs-site-meta">{{ site.note }}</div>
                </div>
                <template v-for="day in safeWeekDays" :key="`${site.id}-${day.toISOString()}`">
                  <button
                    v-if="isSlotVisible(slotKey(site.id, day))"
                    type="button"
                    :class="[
                      'blogs-cell',
                      isToday(day) && 'is-today',
                      isPublishDay(day) && 'is-target',
                      selectedSlot === slotKey(site.id, day) && 'is-selected',
                      selectedSlots.includes(slotKey(site.id, day)) && 'is-multi-selected',
                      notesBySlot[slotKey(site.id, day)] && 'has-note',
                    ]"
                    @click="handleCellClick(slotKey(site.id, day))"
                  >
                  <div class="blogs-cell-top">
                    <span class="blogs-cell-count">0</span>
                    <span class="blogs-cell-label">Posts</span>
                  </div>
                    <div class="blogs-cell-body">
                      <span
                        v-if="isPublishDay(day)"
                        :class="[
                          'blogs-cell-status-badge',
                          isSlotComplete(slotKey(site.id, day)) ? 'is-complete' : 'is-pending',
                        ]"
                      >
                        {{ isSlotComplete(slotKey(site.id, day)) ? "Completed" : "Not completed" }}
                      </span>
                      <span v-else class="blogs-cell-prep">Prep day</span>
                    </div>
                    <div class="blogs-cell-footer">
                      <span v-if="isPublishDay(day)" class="blogs-cell-edit">Edit</span>
                      <span v-else class="blogs-cell-muted">Writing window</span>
                    </div>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </section>

        <aside class="blogs-side">
          <div class="panel blogs-panel">
            <div class="blogs-panel-header">
              <h2>Weekly Overview</h2>
              <span class="blogs-panel-pill">Week {{ currentWeek.week }}</span>
            </div>
            <div class="blogs-stats">
              <div class="blogs-stat">
                <span>Planned</span>
                <strong>0</strong>
              </div>
              <div class="blogs-stat">
                <span>Drafts due</span>
                <strong>0</strong>
              </div>
              <div class="blogs-stat">
                <span>Ready</span>
                <strong>0</strong>
              </div>
            </div>
            <div class="blogs-progress">
              <div class="blogs-progress-track">
                <span class="blogs-progress-fill" style="width: 0%"></span>
              </div>
              <span class="blogs-progress-meta">0 / 14 planned</span>
            </div>
          </div>

          <div class="panel blogs-panel">
            <h2>Quick Actions</h2>
            <div class="blogs-actions">
              <button type="button" class="btn-primary w-full">Create post</button>
              <button type="button" class="btn-ghost w-full">Open blog files</button>
              <button type="button" class="btn-ghost w-full">Export weekly pack</button>
            </div>
          </div>

          <div class="panel blogs-panel">
            <div class="blogs-panel-header">
              <h2>Weekly List</h2>
              <span class="blogs-panel-pill">{{ weeklyNotes.length }}</span>
            </div>
            <div v-if="weeklyNotes.length" class="blogs-weekly-list">
              <button
                v-for="note in weeklyNotes"
                :key="note.slot"
                type="button"
                class="blogs-weekly-item"
                @click="openNoteForSlot(note.slot)"
              >
                <div class="blogs-weekly-item-top">
                  <strong>{{ note.title || "Untitled" }}</strong>
                  <span class="blogs-weekly-status" :data-status="note.status">{{ note.status }}</span>
                </div>
                <span class="blogs-weekly-meta">{{ note.label }}</span>
              </button>
            </div>
            <div v-else class="blogs-empty">No notes created this week.</div>
          </div>

          <div class="panel blogs-panel">
            <h2>Ready to Paste</h2>
            <div class="blogs-empty">
              No posts are marked ready yet. Drafts will show here once marked ready.
            </div>
          </div>
        </aside>
      </div>

      <div v-if="isNoteOpen" class="blogs-note-overlay" @click.self="closeNote">
        <div class="blogs-note-modal">
          <div class="blogs-note-header">
            <div>
              <p class="blogs-note-kicker">Weekly note</p>
              <h3 class="blogs-note-title">{{ activeSlotLabel }}</h3>
              <p class="blogs-note-meta">Last saved {{ activeNoteUpdated }}</p>
            </div>
            <button type="button" class="btn-ghost text-xs px-3 py-1.5" @click="closeNote">
              Close
            </button>
          </div>
          <div class="blogs-note-content">
            <div class="blogs-note-form">
              <div class="blogs-note-body">
                <label>
                  <span>Title</span>
                  <input v-model="noteForm.title" type="text" placeholder="Post title" />
                </label>
                <label class="is-wide">
                  <span>Description</span>
                  <textarea v-model="noteForm.description" rows="3" placeholder="Short description"></textarea>
                </label>
                <label>
                  <span>Status</span>
                  <select v-model="noteForm.status">
                    <option value="idea">Idea</option>
                    <option value="draft">Draft</option>
                    <option value="ready">Ready</option>
                    <option value="published">Published</option>
                  </select>
                </label>
                <label>
                  <span>Image URL</span>
                  <input v-model="noteForm.imageUrl" type="text" placeholder="https://..." />
                </label>
                <label>
                  <span>Focus word</span>
                  <input v-model="noteForm.focusWord" type="text" placeholder="Main keyword" />
                </label>
                <label>
                  <span>SEO title</span>
                  <input v-model="noteForm.seoTitle" type="text" placeholder="SEO title" />
                </label>
                <label>
                  <span>Permalink</span>
                  <input v-model="noteForm.permalink" type="text" placeholder="/your-slug" />
                </label>
                <label class="is-wide">
                  <span>SEO description</span>
                  <textarea v-model="noteForm.seoDescription" rows="3" placeholder="Meta description"></textarea>
                </label>
                <label>
                  <span>Alt text</span>
                  <input v-model="noteForm.altText" type="text" placeholder="Image alt text" />
                </label>
                <label>
                  <span>Image title</span>
                  <input v-model="noteForm.imageTitle" type="text" placeholder="Image title" />
                </label>
                <label>
                  <span>Image caption</span>
                  <input v-model="noteForm.imageCaption" type="text" placeholder="Image caption" />
                </label>
                <label class="is-wide">
                  <span>Image description</span>
                  <textarea v-model="noteForm.imageDescription" rows="3" placeholder="Image description"></textarea>
                </label>
              </div>
            </div>
            <aside class="blogs-note-preview">
              <div class="blogs-note-preview-card">
                <h4>Preview</h4>
                <div class="blogs-note-preview-block">
                  <span>Title</span>
                  <strong>{{ noteForm.title || "Untitled post" }}</strong>
                </div>
                <div class="blogs-note-preview-block">
                  <span>Permalink</span>
                  <p>{{ noteForm.permalink || "/your-slug" }}</p>
                </div>
                <div class="blogs-note-preview-block">
                  <span>SEO title</span>
                  <p>{{ noteForm.seoTitle || "SEO title goes here" }}</p>
                </div>
                <div class="blogs-note-preview-block">
                  <span>SEO description</span>
                  <p>{{ noteForm.seoDescription || "Meta description preview text." }}</p>
                </div>
              </div>
              <div class="blogs-note-preview-card">
                <h4>Checklist</h4>
                <ul>
                  <li :class="{ 'is-done': !!noteForm.title }">Title</li>
                  <li :class="{ 'is-done': !!noteForm.permalink }">Permalink</li>
                  <li :class="{ 'is-done': !!noteForm.seoTitle }">SEO title</li>
                  <li :class="{ 'is-done': !!noteForm.seoDescription }">SEO description</li>
                  <li :class="{ 'is-done': !!noteForm.imageUrl }">Image URL</li>
                </ul>
              </div>
            </aside>
          </div>
          <div class="blogs-note-footer">
            <button type="button" class="btn-ghost" @click="clearNote">Clear</button>
            <div class="blogs-note-footer-actions">
              <button type="button" class="btn-ghost" @click="copyNote">Copy pack</button>
              <button type="button" class="btn-ghost" @click="downloadNote">Download TXT</button>
              <button type="button" class="btn-primary" @click="saveNote">Save note</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";

const sites = [
  { id: "united-state-of-excavator", name: "United State of Excavator", note: "Primary" },
  { id: "new-digger", name: "New Digger", note: "Secondary" },
  { id: "new-digger-for-sale", name: "New Digger For Sale", note: "Industry" },
  { id: "usa-excavator", name: "USA EXCAVATOR", note: "Regional" },
  { id: "tiny-excavator", name: "Tiny Excavator", note: "Product" },
  { id: "new-excavator-for-sale", name: "New Excavator For Sale", note: "SEO" },
  { id: "new-excavator", name: "New Excavator", note: "Growth" },
];

const getIsoWeekInfo = (date: Date) => {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: utc.getUTCFullYear(), week };
};

const getIsoWeekStart = (year: number, week: number) => {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay() || 7;
  simple.setUTCDate(simple.getUTCDate() + (1 - dow));
  return simple;
};

const today = new Date();
const currentWeek = ref(getIsoWeekInfo(today));
const jumpWeek = ref(currentWeek.value.week);
const jumpYear = ref(currentWeek.value.year);
const selectedSlot = ref<string | null>(null);
const isNoteOpen = ref(false);
const activeSlot = ref<string | null>(null);
const STORAGE_KEY = "blogs-notes";
const user = useSupabaseUser();
const runtimeConfig = useRuntimeConfig();
const devOwnerId = computed(() => runtimeConfig.public.devOwnerId || "");
const hydrating = ref(true);
const syncStatus = ref<"idle" | "syncing" | "synced" | "error">("idle");
const syncMessage = ref("");
const lastSyncedAt = ref<string | null>(null);
let syncTimer: ReturnType<typeof setTimeout> | null = null;
const stateUpdatedAt = ref<string | null>(null);

const notesBySlot = reactive<Record<string, NotePayload>>({});
const noteForm = reactive<NotePayload>({
  title: "",
  description: "",
  imageUrl: "",
  focusWord: "",
  seoTitle: "",
  permalink: "",
  seoDescription: "",
  altText: "",
  imageTitle: "",
  imageCaption: "",
  imageDescription: "",
  status: "idea",
  updatedAt: null,
});
const multiSelect = ref(false);
const selectedSlots = ref<string[]>([]);
const searchTerm = ref("");
const statusFilter = ref<NotePayload["status"] | "all">("all");
let autosaveTimer: ReturnType<typeof setInterval> | null = null;

const weekStart = computed(() => getIsoWeekStart(currentWeek.value.year, currentWeek.value.week));
const weekDays = computed(() => {
  const start = weekStart.value;
  return Array.from({ length: 7 }).map((_, index) => {
    const next = new Date(start);
    next.setUTCDate(start.getUTCDate() + index);
    return next;
  });
});
const isValidDate = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());
const safeWeekDays = computed(() => weekDays.value.filter(isValidDate));
const rangeStart = computed(() => safeWeekDays.value[0] || null);
const rangeEnd = computed(() => safeWeekDays.value[6] || safeWeekDays.value.at(-1) || null);

const shiftWeek = (delta: number) => {
  const start = weekStart.value;
  const next = new Date(start);
  next.setUTCDate(start.getUTCDate() + delta * 7);
  currentWeek.value = getIsoWeekInfo(next);
  jumpWeek.value = currentWeek.value.week;
  jumpYear.value = currentWeek.value.year;
};

const goToThisWeek = () => {
  currentWeek.value = getIsoWeekInfo(new Date());
  jumpWeek.value = currentWeek.value.week;
  jumpYear.value = currentWeek.value.year;
};

const jumpToWeek = () => {
  const week = Math.min(53, Math.max(1, Number(jumpWeek.value) || 1));
  const year = Math.min(2100, Math.max(2020, Number(jumpYear.value) || currentWeek.value.year));
  currentWeek.value = { week, year };
};

const formatDayLabel = (date: Date) =>
  date.toLocaleDateString("en-US", { weekday: "short" });

const formatDayNumber = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatRangeLabel = (start: Date | null, end: Date | null) => {
  if (!start || !end) return "";
  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
};

const isToday = (date: Date) => {
  const now = new Date();
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
};

const dayKey = (date: Date) => date.toISOString().slice(0, 10);
const slotKey = (siteId: string, date: Date) => `${siteId}-${dayKey(date)}`;
const isPublishDay = (date: Date) => {
  const day = date.getUTCDay();
  return day === 1 || day === 4;
};

const isNoteComplete = (note?: NotePayload) => {
  if (!note) return false;
  const fields = [
    note.title,
    note.description,
    note.imageUrl,
    note.focusWord,
    note.seoTitle,
    note.permalink,
    note.seoDescription,
    note.altText,
    note.imageTitle,
    note.imageCaption,
    note.imageDescription,
  ];
  return fields.some((value) => String(value || "").trim().length > 0);
};

const isSlotComplete = (slot: string) => isNoteComplete(notesBySlot[slot]);
const isSlotPublishDay = (slot: string) => {
  const datePart = slot.slice(-10);
  const date = new Date(datePart);
  if (Number.isNaN(date.getTime())) return false;
  return isPublishDay(date);
};

type NotePayload = {
  title: string;
  description: string;
  imageUrl: string;
  focusWord: string;
  seoTitle: string;
  permalink: string;
  seoDescription: string;
  altText: string;
  imageTitle: string;
  imageCaption: string;
  imageDescription: string;
  status: "idea" | "draft" | "ready" | "published";
  updatedAt: string | null;
};

type BlogState = {
  notes: Record<string, NotePayload>;
  updatedAt?: string;
};

const normalizeNote = (note: Partial<NotePayload>): NotePayload => ({
  title: note.title ?? "",
  description: note.description ?? "",
  imageUrl: note.imageUrl ?? "",
  focusWord: note.focusWord ?? "",
  seoTitle: note.seoTitle ?? "",
  permalink: note.permalink ?? "",
  seoDescription: note.seoDescription ?? "",
  altText: note.altText ?? "",
  imageTitle: note.imageTitle ?? "",
  imageCaption: note.imageCaption ?? "",
  imageDescription: note.imageDescription ?? "",
  status: note.status ?? "idea",
  updatedAt: note.updatedAt ?? null,
});

const normalizeNotes = (notes: Record<string, Partial<NotePayload>>) => {
  const normalized: Record<string, NotePayload> = {};
  Object.entries(notes || {}).forEach(([key, value]) => {
    normalized[key] = normalizeNote(value || {});
  });
  return normalized;
};

const applyNotes = (notes: Record<string, NotePayload>) => {
  Object.keys(notesBySlot).forEach((key) => {
    delete notesBySlot[key];
  });
  Object.entries(notes).forEach(([key, value]) => {
    notesBySlot[key] = value;
  });
};

const buildState = (): BlogState => {
  if (!stateUpdatedAt.value) {
    stateUpdatedAt.value = new Date().toISOString();
  }
  return {
    notes: normalizeNotes(notesBySlot),
    updatedAt: stateUpdatedAt.value ?? undefined,
  };
};

const readLocalState = (): BlogState | null => {
  if (!process.client) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as any;
    if (parsed && typeof parsed === "object") {
      if (parsed.notes && typeof parsed.notes === "object") {
        return {
          notes: normalizeNotes(parsed.notes),
          updatedAt: parsed.updatedAt,
        };
      }
      return {
        notes: normalizeNotes(parsed),
        updatedAt: parsed.updatedAt,
      };
    }
  } catch {
    // ignore
  }
  return null;
};

const saveRemote = async (stateOverride?: BlogState, ownerOverride?: string) => {
  if (!process.client) return;
  const effectiveId = ownerOverride || user.value?.id || devOwnerId.value;
  if (!effectiveId) return;
  const state = stateOverride ?? buildState();
  try {
    syncStatus.value = "syncing";
    await $fetch("/api/blogs/save", {
      method: "POST",
      body: { ownerId: effectiveId, state },
    });
    syncStatus.value = "synced";
    syncMessage.value = "";
    lastSyncedAt.value = new Date().toISOString();
  } catch {
    syncStatus.value = "error";
    syncMessage.value = "Sync failed";
  }
};

const queueRemoteSave = () => {
  if (hydrating.value) return;
  const effectiveId = user.value?.id || devOwnerId.value;
  if (!effectiveId) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    saveRemote();
  }, 700);
};

const persistNotes = (options?: { skipRemote?: boolean; preserveUpdatedAt?: boolean }) => {
  if (!process.client) return;
  if (!options?.preserveUpdatedAt) {
    stateUpdatedAt.value = new Date().toISOString();
  } else if (!stateUpdatedAt.value) {
    stateUpdatedAt.value = new Date().toISOString();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(buildState()));
  if (!options?.skipRemote) {
    queueRemoteSave();
  }
};

const loadRemote = async () => {
  if (!process.client) return;
  hydrating.value = true;
  const effectiveId = user.value?.id || devOwnerId.value;
  const localState = readLocalState();

  const fallbackToLocal = async () => {
    if (localState) {
      applyNotes(localState.notes);
      stateUpdatedAt.value = localState.updatedAt ?? null;
      persistNotes({ skipRemote: true, preserveUpdatedAt: true });
      return;
    }
    applyNotes({});
    stateUpdatedAt.value = new Date().toISOString();
    persistNotes({ skipRemote: true, preserveUpdatedAt: true });
  };

  try {
    if (!effectiveId) {
      syncStatus.value = "idle";
      await fallbackToLocal();
      return;
    }
    syncStatus.value = "syncing";
    const response = await $fetch<{ state?: BlogState | null }>("/api/blogs/list", {
      query: { ownerId: effectiveId },
    });
    const remoteState = response?.state ?? null;
    const remoteNotes = remoteState?.notes && typeof remoteState.notes === "object"
      ? normalizeNotes(remoteState.notes)
      : null;
    const remoteUpdatedRaw = remoteState?.updatedAt ? Date.parse(remoteState.updatedAt) : 0;
    const localUpdatedRaw = localState?.updatedAt ? Date.parse(localState.updatedAt) : 0;
    const remoteUpdated = Number.isNaN(remoteUpdatedRaw) ? 0 : remoteUpdatedRaw;
    const localUpdated = Number.isNaN(localUpdatedRaw) ? 0 : localUpdatedRaw;

    if (remoteNotes && Object.keys(remoteNotes).length) {
      if (localState && localUpdated > remoteUpdated) {
        applyNotes(localState.notes);
        stateUpdatedAt.value = localState.updatedAt ?? null;
        persistNotes({ skipRemote: true, preserveUpdatedAt: true });
        await saveRemote(buildState(), effectiveId);
      } else {
        applyNotes(remoteNotes);
        stateUpdatedAt.value = remoteState?.updatedAt ?? null;
        persistNotes({ skipRemote: true, preserveUpdatedAt: true });
        syncStatus.value = "synced";
        syncMessage.value = "";
        lastSyncedAt.value = new Date().toISOString();
      }
      return;
    }

    if (localState && Object.keys(localState.notes).length) {
      applyNotes(localState.notes);
      stateUpdatedAt.value = localState.updatedAt ?? null;
      persistNotes({ skipRemote: true, preserveUpdatedAt: true });
      await saveRemote(buildState(), effectiveId);
      return;
    }
    await fallbackToLocal();
  } catch {
    syncStatus.value = "error";
    syncMessage.value = "Sync failed";
    await fallbackToLocal();
  } finally {
    hydrating.value = false;
  }
};

const resetNoteForm = (payload?: NotePayload) => {
  noteForm.title = payload?.title || "";
  noteForm.description = payload?.description || "";
  noteForm.imageUrl = payload?.imageUrl || "";
  noteForm.focusWord = payload?.focusWord || "";
  noteForm.seoTitle = payload?.seoTitle || "";
  noteForm.permalink = payload?.permalink || "";
  noteForm.seoDescription = payload?.seoDescription || "";
  noteForm.altText = payload?.altText || "";
  noteForm.imageTitle = payload?.imageTitle || "";
  noteForm.imageCaption = payload?.imageCaption || "";
  noteForm.imageDescription = payload?.imageDescription || "";
  noteForm.status = payload?.status || "idea";
  noteForm.updatedAt = payload?.updatedAt || null;
};

const openNoteForSlot = (slot: string) => {
  selectedSlot.value = slot;
  activeSlot.value = slot;
  resetNoteForm(notesBySlot[slot]);
  isNoteOpen.value = true;
};

const toggleMultiSelect = () => {
  multiSelect.value = !multiSelect.value;
  selectedSlots.value = [];
};

const toggleSlotSelection = (slot: string) => {
  if (selectedSlots.value.includes(slot)) {
    selectedSlots.value = selectedSlots.value.filter((item) => item !== slot);
  } else {
    selectedSlots.value = [...selectedSlots.value, slot];
  }
};

const handleCellClick = (slot: string) => {
  if (multiSelect.value) {
    toggleSlotSelection(slot);
    return;
  }
  openNoteForSlot(slot);
};

const closeNote = () => {
  isNoteOpen.value = false;
};

const saveNote = () => {
  if (!activeSlot.value) return;
  noteForm.updatedAt = new Date().toISOString();
  notesBySlot[activeSlot.value] = { ...noteForm };
  persistNotes();
  isNoteOpen.value = false;
};

const clearNote = () => {
  if (!activeSlot.value) return;
  delete notesBySlot[activeSlot.value];
  resetNoteForm();
  persistNotes();
};

const activeSlotLabel = computed(() => {
  if (!activeSlot.value) return "";
  const datePart = activeSlot.value.slice(-10);
  const siteId = activeSlot.value.slice(0, -11);
  const siteName = sites.find((site) => site.id === siteId)?.name || "Site";
  const dateLabel = new Date(datePart).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  return `${siteName} · ${dateLabel}`;
});

const buildExportText = (payload: NotePayload, label: string) => {
  const lines = [
    `Slot: ${label || "Weekly note"}`,
    `Status: ${payload.status || "idea"}`,
    `Last updated: ${payload.updatedAt || "-"}`,
    `Title: ${payload.title || "-"}`,
    `Description: ${payload.description || "-"}`,
    `Image URL: ${payload.imageUrl || "-"}`,
    `Focus word: ${payload.focusWord || "-"}`,
    `SEO title: ${payload.seoTitle || "-"}`,
    `Permalink: ${payload.permalink || "-"}`,
    `SEO description: ${payload.seoDescription || "-"}`,
    `Alt text: ${payload.altText || "-"}`,
    `Image title: ${payload.imageTitle || "-"}`,
    `Image caption: ${payload.imageCaption || "-"}`,
    `Image description: ${payload.imageDescription || "-"}`,
  ];
  return lines.join("\n\n");
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const makeFileName = (label: string, ext: string) => {
  const base = label || "weekly-note";
  const safe = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${safe || "weekly-note"}.${ext}`;
};

const downloadNote = () => {
  if (typeof window === "undefined") return;
  const label = activeSlotLabel.value || "weekly-note";
  const text = buildExportText(noteForm, label);
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), makeFileName(label, "txt"));
};

const copyNote = async () => {
  if (typeof window === "undefined") return;
  try {
    const label = activeSlotLabel.value || "weekly-note";
    const text = buildExportText(noteForm, label);
    await navigator.clipboard.writeText(text);
  } catch {
    // no-op
  }
};

const getSlotLabel = (slot: string) => {
  const datePart = slot.slice(-10);
  const siteId = slot.slice(0, -11);
  const siteName = sites.find((site) => site.id === siteId)?.name || "Site";
  const dateLabel = new Date(datePart).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  return `${siteName} · ${dateLabel}`;
};

const exportSelected = async () => {
  if (!selectedSlots.value.length) return;
  if (selectedSlots.value.length === 1) {
    const slot = selectedSlots.value[0];
    const payload = notesBySlot[slot] || {
      title: "",
      description: "",
      imageUrl: "",
      focusWord: "",
      seoTitle: "",
      permalink: "",
      seoDescription: "",
      altText: "",
      imageTitle: "",
      imageCaption: "",
      imageDescription: "",
      status: "idea",
      updatedAt: null,
    };
    const label = getSlotLabel(slot);
    const text = buildExportText(payload, label);
    downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), makeFileName(label, "txt"));
    return;
  }

  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  selectedSlots.value.forEach((slot) => {
    const payload = notesBySlot[slot] || {
      title: "",
      description: "",
      imageUrl: "",
      focusWord: "",
      seoTitle: "",
      permalink: "",
      seoDescription: "",
      altText: "",
      imageTitle: "",
      imageCaption: "",
      imageDescription: "",
      status: "idea",
      updatedAt: null,
    };
    const label = getSlotLabel(slot);
    const text = buildExportText(payload, label);
    zip.file(makeFileName(label, "txt"), text);
  });
  const blob = await zip.generateAsync({ type: "blob" });
  const archiveName = `weekly-notes-week-${currentWeek.value.week}-${currentWeek.value.year}.zip`;
  downloadBlob(blob, archiveName);
};

const exportWeek = async () => {
  const slots = weekSlots.value.filter((slot) => notesBySlot[slot] && isSlotPublishDay(slot));
  if (!slots.length) return;
  if (slots.length === 1) {
    const slot = slots[0];
    const payload = notesBySlot[slot];
    const label = getSlotLabel(slot);
    const text = buildExportText(payload, label);
    downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), makeFileName(label, "txt"));
    return;
  }
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  slots.forEach((slot) => {
    const payload = notesBySlot[slot];
    const label = getSlotLabel(slot);
    const text = buildExportText(payload, label);
    zip.file(makeFileName(label, "txt"), text);
  });
  const blob = await zip.generateAsync({ type: "blob" });
  const archiveName = `weekly-notes-week-${currentWeek.value.week}-${currentWeek.value.year}.zip`;
  downloadBlob(blob, archiveName);
};

const clearWeekNotes = () => {
  const slots = weekSlots.value;
  slots.forEach((slot) => {
    delete notesBySlot[slot];
  });
  persistNotes();
};

const weekSlots = computed(() =>
  sites.flatMap((site) => safeWeekDays.value.map((day) => slotKey(site.id, day)))
);

const weeklyNotes = computed(() => {
  const slots = weekSlots.value.filter((slot) => notesBySlot[slot]);
  return slots.map((slot) => {
    const note = notesBySlot[slot];
    return {
      slot,
      title: note.title,
      status: note.status,
      label: getSlotLabel(slot),
    };
  });
});

const isSlotVisible = (slot: string) => {
  const note = notesBySlot[slot];
  if (!note) {
    return !searchTerm.value && statusFilter.value === "all";
  }
  const search = searchTerm.value.toLowerCase();
  const matchesSearch =
    !search ||
    note.title.toLowerCase().includes(search) ||
    note.description.toLowerCase().includes(search) ||
    note.permalink.toLowerCase().includes(search) ||
    note.seoTitle.toLowerCase().includes(search) ||
    note.seoDescription.toLowerCase().includes(search);
  const matchesStatus = statusFilter.value === "all" || note.status === statusFilter.value;
  return matchesSearch && matchesStatus;
};

const filteredCount = computed(() => {
  const slots = weekSlots.value.filter((slot) => notesBySlot[slot]);
  if (!slots.length) return 0;
  return slots.filter((slot) => isSlotVisible(slot)).length;
});

const activeNoteUpdated = computed(() => {
  if (!activeSlot.value) return "—";
  const updated = notesBySlot[activeSlot.value]?.updatedAt || noteForm.updatedAt;
  if (!updated) return "—";
  return new Date(updated).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const autosaveNote = () => {
  if (!activeSlot.value) return;
  noteForm.updatedAt = new Date().toISOString();
  notesBySlot[activeSlot.value] = { ...noteForm };
  persistNotes({ preserveUpdatedAt: true });
};

watch(isNoteOpen, (open) => {
  if (open) {
    if (autosaveTimer) clearInterval(autosaveTimer);
    autosaveTimer = setInterval(autosaveNote, 10000);
    return;
  }
  if (autosaveTimer) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
  }
});

onMounted(() => {
  loadRemote();
});


onUnmounted(() => {
  if (autosaveTimer) clearInterval(autosaveTimer);
  if (syncTimer) clearTimeout(syncTimer);
});
</script>
