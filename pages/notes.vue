<template>
  <section class="page-shell page-form page-notes">
    <div class="page-surface">
      <div class="compact-shell fade-up note-form">
        <header class="create-hero">
          <div class="create-hero-main">
            <span class="section-kicker">Notes</span>
            <h1 class="section-title">Personal file vault</h1>
            <p class="section-subtitle">
              Organize quick notes into folders and files. Everything autosaves as you type.
            </p>
            <div class="create-hero-meta">
              <div class="create-hero-chip">
                <span class="create-hero-chip-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z"></path>
                  </svg>
                </span>
                <div>
                  <p>Folders</p>
                  <strong>{{ folders.length }}</strong>
                </div>
              </div>
              <div class="create-hero-chip">
                <span class="create-hero-chip-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </span>
                <div>
                  <p>Files</p>
                  <strong>{{ totalFiles }}</strong>
                </div>
              </div>
              <div class="create-hero-chip">
                <span class="create-hero-chip-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12h18"></path>
                    <path d="M12 3v18"></path>
                  </svg>
                </span>
                <div>
                  <p>Active file</p>
                  <strong>{{ activeFile?.name || "none" }}</strong>
                </div>
              </div>
            </div>
          </div>
          <div class="create-hero-panel">
            <div class="create-hero-panel-title">Quick tips</div>
            <div class="create-hero-panel-row">
              <span>Autosave</span>
              <strong>On</strong>
            </div>
            <div class="create-hero-panel-row">
              <span>Sync</span>
              <strong
                :class="[
                  !canSync && 'text-slate-300',
                  syncStatus === 'syncing' && 'text-cyan-200',
                  syncStatus === 'synced' && 'text-emerald-200',
                  syncStatus === 'error' && 'text-rose-200'
                ]"
              >
                {{ syncLabel }}
              </strong>
            </div>
            <div v-if="canSync && lastSyncedAt" class="create-hero-panel-row">
              <span>Last sync</span>
              <strong>{{ formatTime(lastSyncedAt) }}</strong>
            </div>
            <div class="create-hero-panel-row">
              <span>Files</span>
              <strong>Editable</strong>
            </div>
            <div class="create-hero-panel-row">
              <span>Folders</span>
              <strong>Organized</strong>
            </div>
          </div>
        </header>

        <div class="note-toolbar panel compact-panel">
          <div class="note-toolbar-left">
            <div class="note-search">
              <span class="note-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"></circle>
                  <path d="M21 21l-4.3-4.3"></path>
                </svg>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="note-input note-search-input"
                placeholder="Search folders, files, content"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="note-search-clear"
                @click="clearSearch"
              >
                Clear
              </button>
            </div>
            <div class="note-breadcrumb" v-if="activeFolder || activeFile">
              <span class="note-breadcrumb-label">Active</span>
              <span class="note-breadcrumb-item">{{ activeFolder?.name || "Folder" }}</span>
              <span class="note-breadcrumb-divider">/</span>
              <span class="note-breadcrumb-item">{{ activeFile?.name || "File" }}</span>
            </div>
          </div>
          <div class="note-toolbar-right">
            <div class="note-filter-group">
              <button
                type="button"
                :class="['note-filter-pill', filterMode === 'all' && 'note-filter-pill-active']"
                @click="setFilter('all')"
              >
                All
              </button>
              <button
                type="button"
                :class="['note-filter-pill', filterMode === 'starred' && 'note-filter-pill-active']"
                @click="setFilter('starred')"
              >
                Starred
              </button>
              <button
                type="button"
                :class="['note-filter-pill', filterMode === 'recent' && 'note-filter-pill-active']"
                @click="setFilter('recent')"
              >
                Recent
              </button>
            </div>
            <select v-model="sortMode" class="note-select">
              <option value="recent">Sort: Recent</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        <div v-if="searchQuery" class="note-results panel compact-panel">
          <div class="note-results-head">
            <span>Search results</span>
            <span class="note-results-count">{{ searchResults.length }} of {{ searchResultCount }}</span>
          </div>
          <div v-if="!searchResults.length" class="note-empty">No matches yet.</div>
          <div v-else class="note-results-grid stagger">
            <button
              v-for="result in searchResults"
              :key="result.fileId"
              type="button"
              class="note-result-item"
              @click="openSearchResult(result)"
            >
              <span class="note-result-title">{{ result.fileName }}</span>
              <span class="note-result-sub">{{ result.folderName }}</span>
            </button>
          </div>
        </div>

        <div class="note-shell grid gap-5 lg:grid-cols-[360px,1fr]">
          <aside class="note-sidebar">
            <div class="panel compact-panel note-panel note-quick-panel">
              <div class="note-panel-head">
                <div class="note-panel-title-row">
                  <span class="note-panel-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                  </span>
                  <div>
                    <p class="note-kicker">Quick</p>
                    <h2 class="note-title">Actions</h2>
                  </div>
                </div>
              </div>
              <div class="note-quick-actions">
                <button type="button" class="note-action-pill" @click="quickAddFolder">New folder</button>
                <button type="button" class="note-action-pill" :disabled="!activeFolder" @click="quickAddFile">New file</button>
                <button type="button" class="note-action-pill" :disabled="!recentFiles.length" @click="jumpToLatest">Last edited</button>
              </div>
            </div>
            <div class="panel compact-panel note-panel">
              <div class="note-panel-head">
                <div class="note-panel-title-row">
                  <span class="note-panel-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z"></path>
                    </svg>
                  </span>
                  <div>
                    <p class="note-kicker">Folders</p>
                    <h2 class="note-title">Workspaces</h2>
                  </div>
                </div>
              </div>
              <div class="note-input-row">
                <input
                  v-model="newFolderName"
                  type="text"
                  placeholder="Folder"
                  class="note-input"
                  @keydown.enter.prevent="addFolder"
                />
                <button type="button" class="btn-ghost note-pill" @click="addFolder">
                  <span class="note-pill-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                  </span>
                  Add
                </button>
              </div>
              <div class="note-list">
                <div v-if="!filteredFolders.length" class="note-empty">No folders yet.</div>
                <div v-for="folder in filteredFolders" :key="folder.id" class="note-row">
                  <button
                    type="button"
                    :class="['note-item', activeFolderId === folder.id && 'note-item-active']"
                    @click="setActiveFolder(folder.id)"
                  >
                    <span class="note-item-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z"></path>
                      </svg>
                    </span>
                    <span class="note-item-name">{{ folder.name }}</span>
                    <span class="note-count">{{ folder.files.length }}</span>
                  </button>
                  <button type="button" class="note-item-action" @click="removeFolder(folder.id)">Del</button>
                </div>
              </div>
            </div>

            <div class="panel compact-panel note-panel">
              <div class="note-panel-head">
                <div class="note-panel-title-row">
                  <span class="note-panel-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </span>
                  <div>
                    <p class="note-kicker">Files</p>
                    <h2 class="note-title">Notes</h2>
                  </div>
                </div>
              </div>
              <div v-if="starredFiles.length" class="note-favorites">
                <p class="note-favorites-title">Favorites</p>
                <div class="note-favorites-grid">
                  <button
                    v-for="file in starredFiles.slice(0, 4)"
                    :key="file.id"
                    type="button"
                    class="note-favorite-item"
                    @click="openFavorite(file)"
                  >
                    <span>{{ file.name }}</span>
                    <span class="note-favorite-meta">{{ file.folderName }}</span>
                  </button>
                </div>
              </div>
              <div class="note-input-row">
                <input
                  v-model="newFileName"
                  type="text"
                  placeholder="File"
                  class="note-input"
                  :disabled="!activeFolder"
                  @keydown.enter.prevent="addFile"
                />
                <button
                  type="button"
                  class="btn-ghost note-pill"
                  :disabled="!activeFolder"
                  @click="addFile"
                >
                  <span class="note-pill-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                  </span>
                  Add
                </button>
              </div>
              <div class="note-list">
                <div v-if="!activeFolder" class="note-empty">Pick a folder first.</div>
                <div v-else-if="!visibleFiles.length" class="note-empty">No files yet.</div>
                <div v-else v-for="file in visibleFiles" :key="file.id" class="note-row">
                  <button
                    type="button"
                    :class="['note-item', activeFileId === file.id && 'note-item-active']"
                    @click="setActiveFile(file.id)"
                  >
                    <span class="note-item-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    </span>
                    <span class="note-item-name">{{ file.name }}</span>
                    <span class="note-date">{{ formatDate(file.updatedAt) }}</span>
                  </button>
                  <button
                    type="button"
                    :class="['note-star', file.starred && 'note-star-active']"
                    @click.stop="toggleStar(file)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 3l3 6 6 .9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.9 9 9z"></path>
                    </svg>
                  </button>
                  <button type="button" class="note-item-action" @click="removeFile(file.id)">Del</button>
                </div>
              </div>
            </div>
          </aside>

          <section class="panel compact-panel note-editor">
            <div v-if="!activeFile" class="note-empty">
              Select or create a file to start typing.
            </div>
            <div v-else class="note-editor-shell">
              <div class="note-editor-head">
                <div class="note-editor-title">
                  <span class="note-editor-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16v16H4z"></path>
                      <path d="M8 8h8"></path>
                      <path d="M8 12h8"></path>
                      <path d="M8 16h5"></path>
                    </svg>
                  </span>
                  <input
                    v-model="activeFileName"
                    type="text"
                    class="note-input note-title-input"
                    placeholder="Name"
                  />
                </div>
                <span class="note-date">Updated {{ formatDate(activeFile.updatedAt) }}</span>
              </div>
              <div class="note-editor-meta">
                <div class="note-stat">
                  <span class="note-stat-label">Words</span>
                  <strong class="note-stat-value">{{ wordCount }}</strong>
                </div>
                <div class="note-stat">
                  <span class="note-stat-label">Chars</span>
                  <strong class="note-stat-value">{{ charCount }}</strong>
                </div>
                <div class="note-stat">
                  <span class="note-stat-label">Lines</span>
                  <strong class="note-stat-value">{{ lineCount }}</strong>
                </div>
                <button
                  type="button"
                  :class="['note-star note-star-large', activeFile?.starred && 'note-star-active']"
                  @click="activeFile && toggleStar(activeFile)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3l3 6 6 .9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.9 9 9z"></path>
                  </svg>
                </button>
                <div class="note-editor-actions">
                  <button type="button" class="note-action-pill" @click="copyActiveContent">Copy</button>
                  <button type="button" class="note-action-pill note-action-danger" @click="clearActiveContent">Clear</button>
                </div>
              </div>
              <textarea
                v-model="activeFileContent"
                class="note-editor-input"
                placeholder="Start typing..."
              ></textarea>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";

type NoteFile = {
  id: string;
  name: string;
  content: string;
  updatedAt: string;
  starred: boolean;
};

type NoteFolder = {
  id: string;
  name: string;
  files: NoteFile[];
};

type NoteState = {
  folders: NoteFolder[];
  activeFolderId: string | null;
  activeFileId: string | null;
  updatedAt?: string;
};

const STORAGE_KEY = "noteVault";

const user = useSupabaseUser();
const runtimeConfig = useRuntimeConfig();
const devOwnerId = computed(() => runtimeConfig.public.devOwnerId || "");
const hydrating = ref(true);
const stateUpdatedAt = ref<string | null>(null);
const syncStatus = ref<"idle" | "syncing" | "synced" | "error">("idle");
const syncMessage = ref("");
const lastSyncedAt = ref<string | null>(null);
let syncTimer: ReturnType<typeof setTimeout> | null = null;

const folders = ref<NoteFolder[]>([]);
const activeFolderId = ref<string | null>(null);
const activeFileId = ref<string | null>(null);
const newFolderName = ref("");
const newFileName = ref("");
const searchQuery = ref("");
const filterMode = ref<"all" | "starred" | "recent">("all");
const sortMode = ref<"recent" | "name">("recent");

const totalFiles = computed(() =>
  folders.value.reduce((sum, folder) => sum + folder.files.length, 0)
);

const activeFolder = computed(() =>
  folders.value.find((folder) => folder.id === activeFolderId.value) ?? null
);

const activeFile = computed(() =>
  activeFolder.value?.files.find((file) => file.id === activeFileId.value) ?? null
);

const wordCount = computed(() => {
  if (!activeFile.value?.content) return 0;
  return activeFile.value.content.trim().split(/\s+/).filter(Boolean).length;
});

const charCount = computed(() => activeFile.value?.content.length ?? 0);

const lineCount = computed(() => {
  if (!activeFile.value?.content) return 0;
  return activeFile.value.content.split(/\n/).length;
});

const matchesQuery = (value: string, query: string) =>
  value.toLowerCase().includes(query);

const filteredFolders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return folders.value;
  return folders.value.filter((folder) => {
    if (matchesQuery(folder.name, query)) return true;
    return folder.files.some(
      (file) =>
        matchesQuery(file.name, query) ||
        (file.content && matchesQuery(file.content, query))
    );
  });
});

const visibleFiles = computed(() => {
  const folder = activeFolder.value;
  if (!folder) return [];
  const query = searchQuery.value.trim().toLowerCase();
  let files = folder.files;
  if (query) {
    files = files.filter(
      (file) =>
        matchesQuery(file.name, query) ||
        (file.content && matchesQuery(file.content, query))
    );
  }
  if (filterMode.value === "starred") {
    files = files.filter((file) => file.starred);
  }
  const sorted = [...files].sort((a, b) => {
    if (sortMode.value === "name") {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  if (filterMode.value === "recent") {
    return sorted.slice(0, 12);
  }
  return sorted;
});

const starredFiles = computed(() => {
  const items: Array<NoteFile & { folderId: string; folderName: string }> = [];
  folders.value.forEach((folder) => {
    folder.files.forEach((file) => {
      if (file.starred) {
        items.push({ ...file, folderId: folder.id, folderName: folder.name });
      }
    });
  });
  return items.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
});

const recentFiles = computed(() => {
  const items: Array<NoteFile & { folderId: string; folderName: string }> = [];
  folders.value.forEach((folder) => {
    folder.files.forEach((file) => {
      items.push({ ...file, folderId: folder.id, folderName: folder.name });
    });
  });
  return items.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
});

const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return [];
  const matches: Array<{
    folderId: string;
    folderName: string;
    fileId: string;
    fileName: string;
    updatedAt: string;
  }> = [];
  folders.value.forEach((folder) => {
    folder.files.forEach((file) => {
      if (
        matchesQuery(file.name, query) ||
        (file.content && matchesQuery(file.content, query))
      ) {
        matches.push({
          folderId: folder.id,
          folderName: folder.name,
          fileId: file.id,
          fileName: file.name,
          updatedAt: file.updatedAt
        });
      }
    });
  });
  return matches
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);
});

const searchResultCount = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return 0;
  let count = 0;
  folders.value.forEach((folder) => {
    folder.files.forEach((file) => {
      if (
        matchesQuery(file.name, query) ||
        (file.content && matchesQuery(file.content, query))
      ) {
        count += 1;
      }
    });
  });
  return count;
});

const activeFileName = computed({
  get: () => activeFile.value?.name ?? "",
  set: (value) => {
    if (!activeFile.value) return;
    const next = value.trim() || "Untitled";
    activeFile.value.name = next;
    touchFile(activeFile.value);
    saveState();
  }
});

const activeFileContent = computed({
  get: () => activeFile.value?.content ?? "",
  set: (value) => {
    if (!activeFile.value) return;
    activeFile.value.content = value;
    touchFile(activeFile.value);
    saveState();
  }
});

const makeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const makeUniqueName = (base: string, existing: string[]) => {
  let name = base;
  let index = 1;
  while (existing.includes(name)) {
    index += 1;
    name = `${base} ${index}`;
  }
  return name;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const formatTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

const touchFile = (file?: NoteFile | null) => {
  if (!file) return;
  file.updatedAt = new Date().toISOString();
};

const normalizeFile = (file: Partial<NoteFile>): NoteFile => ({
  id: file.id ?? makeId(),
  name: file.name?.trim() || "Untitled",
  content: file.content ?? "",
  updatedAt: file.updatedAt ?? new Date().toISOString(),
  starred: Boolean(file.starred)
});

const normalizeFolders = (data: NoteFolder[]) =>
  data.map((folder) => ({
    id: folder.id ?? makeId(),
    name: folder.name?.trim() || "Folder",
    files: Array.isArray(folder.files)
      ? folder.files.map((file) => normalizeFile(file))
      : []
  }));

const touchState = () => {
  stateUpdatedAt.value = new Date().toISOString();
};

const buildState = (): NoteState => {
  if (!stateUpdatedAt.value) {
    stateUpdatedAt.value = new Date().toISOString();
  }
  return {
    folders: folders.value,
    activeFolderId: activeFolderId.value,
    activeFileId: activeFileId.value,
    updatedAt: stateUpdatedAt.value
  };
};

const canSync = computed(() => Boolean(user.value?.id || devOwnerId.value));

const syncLabel = computed(() => {
  if (!canSync.value) return "Local only";
  if (syncStatus.value === "syncing") return "Syncing";
  if (syncStatus.value === "error") return syncMessage.value || "Sync issue";
  if (syncStatus.value === "synced") return "Synced";
  return "Autosave";
});

const saveRemote = async (stateOverride?: NoteState, ownerOverride?: string) => {
  if (!process.client) return;
  const effectiveId = ownerOverride || user.value?.id || devOwnerId.value;
  if (!effectiveId) return;
  const state = stateOverride ?? buildState();
  try {
    syncStatus.value = "syncing";
    await $fetch("/api/notes/save", {
      method: "POST",
      body: { ownerId: effectiveId, state }
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

const saveState = (options?: { skipRemote?: boolean; preserveUpdatedAt?: boolean }) => {
  if (!process.client) return;
  if (options?.preserveUpdatedAt) {
    if (!stateUpdatedAt.value) {
      stateUpdatedAt.value = new Date().toISOString();
    }
  } else {
    touchState();
  }
  const payload = buildState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  if (!options?.skipRemote) {
    queueRemoteSave();
  }
};

const readLocalState = (): NoteState | null => {
  if (!process.client) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as NoteState;
      if (parsed && Array.isArray(parsed.folders)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

const applyState = (state: NoteState) => {
  const normalized = normalizeFolders(Array.isArray(state.folders) ? state.folders : []);
  folders.value = normalized;
  const nextFolderId = typeof state.activeFolderId === "string" ? state.activeFolderId : null;
  const nextFileId = typeof state.activeFileId === "string" ? state.activeFileId : null;
  const fallbackFolderId = normalized[0]?.id ?? null;
  activeFolderId.value = normalized.some((folder) => folder.id === nextFolderId)
    ? nextFolderId
    : fallbackFolderId;
  const selectedFolder = normalized.find((folder) => folder.id === activeFolderId.value);
  const fallbackFileId = selectedFolder?.files[0]?.id ?? null;
  activeFileId.value = selectedFolder?.files.some((file) => file.id === nextFileId)
    ? nextFileId
    : fallbackFileId;
  stateUpdatedAt.value = state.updatedAt ?? new Date().toISOString();
};

const seedState = () => {
  const initialFolder: NoteFolder = {
    id: makeId(),
    name: "Main",
    files: [
      {
        id: makeId(),
        name: "Notes",
        content: "",
        updatedAt: new Date().toISOString(),
        starred: false
      }
    ]
  };
  applyState({
    folders: [initialFolder],
    activeFolderId: initialFolder.id,
    activeFileId: initialFolder.files[0].id,
    updatedAt: new Date().toISOString()
  });
  saveState({ preserveUpdatedAt: true, skipRemote: true });
};

const loadState = () => {
  const localState = readLocalState();
  if (localState) {
    applyState(localState);
    saveState({ preserveUpdatedAt: true, skipRemote: true });
    return true;
  }
  return false;
};

const loadRemote = async () => {
  if (!process.client) return;
  hydrating.value = true;
  const effectiveId = user.value?.id || devOwnerId.value;
  const fallbackToLocal = async () => {
    const loaded = loadState();
    if (!loaded) {
      seedState();
      if (effectiveId) {
        await saveRemote(buildState(), effectiveId);
      }
    }
  };
  try {
    if (!effectiveId) {
      syncStatus.value = "idle";
      await fallbackToLocal();
      return;
    }
    syncStatus.value = "syncing";
    const response = await $fetch<{ state?: NoteState }>("/api/notes/list", {
      query: { ownerId: effectiveId }
    });
    const remoteState = response?.state;
    const localState = readLocalState();
    const remoteValid = remoteState && Array.isArray(remoteState.folders);
    const localValid = Boolean(localState?.folders?.length);

    if (remoteValid) {
      const remoteUpdatedRaw = remoteState.updatedAt ? Date.parse(remoteState.updatedAt) : 0;
      const localUpdatedRaw = localState?.updatedAt ? Date.parse(localState.updatedAt) : 0;
      const remoteUpdated = Number.isNaN(remoteUpdatedRaw) ? 0 : remoteUpdatedRaw;
      const localUpdated = Number.isNaN(localUpdatedRaw) ? 0 : localUpdatedRaw;
      if (localValid && localUpdated > remoteUpdated) {
        applyState(localState as NoteState);
        saveState({ preserveUpdatedAt: true, skipRemote: true });
        await saveRemote(buildState(), effectiveId);
      } else {
        applyState(remoteState as NoteState);
        saveState({ preserveUpdatedAt: true, skipRemote: true });
        syncStatus.value = "synced";
        syncMessage.value = "";
        lastSyncedAt.value = new Date().toISOString();
      }
      return;
    }

    if (localValid) {
      applyState(localState as NoteState);
      saveState({ preserveUpdatedAt: true, skipRemote: true });
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

const setActiveFolder = (id: string) => {
  activeFolderId.value = id;
  const folder = folders.value.find((entry) => entry.id === id);
  activeFileId.value = folder?.files[0]?.id ?? null;
  saveState();
};

const setActiveFile = (id: string) => {
  activeFileId.value = id;
  saveState();
};

const addFolder = () => {
  const name = newFolderName.value.trim();
  if (!name) return;
  const folder: NoteFolder = { id: makeId(), name, files: [] };
  folders.value = [folder, ...folders.value];
  activeFolderId.value = folder.id;
  activeFileId.value = null;
  newFolderName.value = "";
  saveState();
};

const addFile = () => {
  if (!activeFolder.value) return;
  const name = newFileName.value.trim() || "Untitled";
  const file: NoteFile = {
    id: makeId(),
    name,
    content: "",
    updatedAt: new Date().toISOString(),
    starred: false
  };
  activeFolder.value.files = [file, ...activeFolder.value.files];
  activeFileId.value = file.id;
  newFileName.value = "";
  saveState();
};

const quickAddFolder = () => {
  const existing = folders.value.map((folder) => folder.name);
  const name = makeUniqueName("New Folder", existing);
  const folder: NoteFolder = { id: makeId(), name, files: [] };
  folders.value = [folder, ...folders.value];
  activeFolderId.value = folder.id;
  activeFileId.value = null;
  saveState();
};

const quickAddFile = () => {
  if (!activeFolder.value) return;
  const existing = activeFolder.value.files.map((file) => file.name);
  const name = makeUniqueName("New Note", existing);
  const file: NoteFile = {
    id: makeId(),
    name,
    content: "",
    updatedAt: new Date().toISOString(),
    starred: false
  };
  activeFolder.value.files = [file, ...activeFolder.value.files];
  activeFileId.value = file.id;
  saveState();
};

const jumpToLatest = () => {
  const latest = recentFiles.value[0];
  if (!latest) return;
  activeFolderId.value = latest.folderId;
  activeFileId.value = latest.id;
  saveState();
};

const toggleStar = (file: NoteFile) => {
  file.starred = !file.starred;
  touchFile(file);
  saveState();
};

const openFavorite = (file: NoteFile & { folderId: string }) => {
  activeFolderId.value = file.folderId;
  activeFileId.value = file.id;
  saveState();
};

const openSearchResult = (result: {
  folderId: string;
  fileId: string;
}) => {
  activeFolderId.value = result.folderId;
  activeFileId.value = result.fileId;
  saveState();
};

const clearSearch = () => {
  searchQuery.value = "";
};

const setFilter = (mode: "all" | "starred" | "recent") => {
  filterMode.value = mode;
};

const copyActiveContent = async () => {
  if (!process.client || !activeFile.value) return;
  try {
    await navigator.clipboard.writeText(activeFile.value.content || "");
  } catch {
    // ignore
  }
};

const clearActiveContent = () => {
  if (!activeFile.value) return;
  activeFileContent.value = "";
};

const removeFolder = (id: string) => {
  const next = folders.value.filter((folder) => folder.id !== id);
  folders.value = next;
  if (activeFolderId.value === id) {
    activeFolderId.value = next[0]?.id ?? null;
    activeFileId.value = next[0]?.files[0]?.id ?? null;
  }
  saveState();
};

const removeFile = (id: string) => {
  if (!activeFolder.value) return;
  activeFolder.value.files = activeFolder.value.files.filter((file) => file.id !== id);
  if (activeFileId.value === id) {
    activeFileId.value = activeFolder.value.files[0]?.id ?? null;
  }
  saveState();
};

onMounted(() => {
  loadRemote();
});

onBeforeUnmount(() => {
  if (syncTimer) {
    clearTimeout(syncTimer);
  }
});

watch(
  () => user.value?.id,
  () => {
    loadRemote();
  }
);

watch(
  () => devOwnerId.value,
  () => {
    if (user.value?.id) return;
    loadRemote();
  }
);
</script>
