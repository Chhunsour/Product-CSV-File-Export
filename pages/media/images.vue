<template>
  <section class="page-shell page-media page-media-images">
    <div class="page-surface">
      <div class="compact-shell">
        <div class="panel compact-panel media-hero">
          <div class="media-hero-top">
            <div>
              <p class="compact-subtitle uppercase tracking-[0.3em]">{{ t("media.images.system") }}</p>
              <h1 class="compact-title">{{ t("media.images.title") }}</h1>
              <p class="compact-subtitle">{{ t("media.images.subtitle") }}</p>
            </div>
            <div class="media-hero-actions">
              <button
                type="button"
                class="btn-ghost text-xs px-3 py-1.5"
                :disabled="loading"
                @click="refreshMedia"
              >
                {{ t("media.refresh") }}
              </button>
              <button
                type="button"
                class="btn-primary text-xs px-3 py-1.5"
                :disabled="!supportsClipboard || !media.length"
                @click="copyLinks"
              >
                {{ t("media.copy_links") }}
              </button>
              <button
                type="button"
                class="btn-ghost text-xs px-3 py-1.5"
                @click="toggleSelectionMode"
              >
                {{ selectionMode ? t("media.done") : t("media.select") }}
              </button>
            </div>
          </div>

          <div class="media-hero-stats">
            <div class="media-stat">
              <span>{{ t("media.total") }}</span>
              <strong>{{ stats?.total ?? 0 }}</strong>
              <small>{{ t("media.images") }}</small>
            </div>
            <div class="media-stat">
              <span>{{ t("media.stored") }}</span>
              <strong>{{ stats?.stored ?? 0 }}</strong>
              <small>{{ t("media.files") }}</small>
            </div>
            <div class="media-stat">
              <span>{{ t("media.linked") }}</span>
              <strong>{{ stats?.linked ?? 0 }}</strong>
              <small>{{ t("media.external") }}</small>
            </div>
            <div class="media-stat">
              <span>{{ t("media.items") }}</span>
              <strong>{{ stats?.items ?? 0 }}</strong>
              <small>{{ t("media.products") }}</small>
            </div>
            <div class="media-stat">
              <span>{{ t("media.webp") }}</span>
              <strong>{{ stats?.webp ?? 0 }}</strong>
              <small>{{ t("media.optimized") }}</small>
            </div>
            <div class="media-stat">
              <span>{{ t("media.updated") }}</span>
              <strong>{{ lastUpdated }}</strong>
              <small>{{ t("media.latest") }}</small>
            </div>
          </div>

          <p v-if="copyStatus" class="media-copy-status">{{ copyStatus }}</p>

          <div v-if="canUpload" class="media-uploader">
            <div class="media-uploader-head">
              <div>
                <p class="media-uploader-title">{{ t("media.add_image") }}</p>
                <p class="media-uploader-subtitle">
                  {{ t("media.add_image_sub") }}
                </p>
              </div>
              <div class="media-uploader-meta">
                <span class="chip">{{ t("media.media_vault") }}</span>
                <span class="chip">Bucket: media</span>
              </div>
            </div>

            <div class="media-uploader-grid">
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.save_to") }}</label>
                <div class="media-vault-pill">{{ t("media.media_vault") }}</div>
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.category_select") }}</label>
                <select v-model="uploadCategory" class="select-compact">
                  <option value="">{{ t("media.category_placeholder") }}</option>
                  <option
                    v-for="category in CATEGORY_DEFS"
                    :key="category.key"
                    :value="category.key"
                  >
                    {{ t(category.labelKey) }}
                  </option>
                </select>
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.product_slug") }}</label>
                <input
                  v-model="uploadProductSlug"
                  type="text"
                  :placeholder="t('media.product_slug_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.product_id") }}</label>
                <input
                  v-model="uploadProductId"
                  type="text"
                  :placeholder="t('media.product_id_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.view") }}</label>
                <input
                  v-model="uploadView"
                  type="text"
                  :placeholder="t('media.view_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.key_spec") }}</label>
                <input
                  v-model="uploadKeySpec"
                  type="text"
                  :placeholder="t('media.key_spec_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">Folder</label>
                <select v-model="uploadFolder" class="select-compact">
                  <option value="">No folder</option>
                  <option v-for="folder in folderOptions" :key="folder.name" :value="folder.name">
                    {{ folder.name }} ({{ folder.count }})
                  </option>
                </select>
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">Create folder</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="newFolderName"
                    type="text"
                    placeholder="Folder name"
                    class="input-compact flex-1"
                  />
                  <button type="button" class="btn-ghost text-xs px-3 py-1.5" @click="addFolder">
                    Add
                  </button>
                </div>
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.label") }}</label>
                <input
                  v-model="uploadLabel"
                  type="text"
                  :placeholder="t('media.label_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.alt_text") }}</label>
                <input
                  v-model="uploadAlt"
                  type="text"
                  :placeholder="t('media.alt_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.title_text") }}</label>
                <input
                  v-model="uploadTitle"
                  type="text"
                  :placeholder="t('media.title_placeholder')"
                  class="input-compact"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">{{ t("media.image_file") }}</label>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="media-file-input"
                  @change="handleFileChange"
                />
              </div>
              <div class="media-uploader-field">
                <label class="media-field-label">Image folder</label>
                <input
                  ref="folderInput"
                  type="file"
                  accept="image/*"
                  multiple
                  webkitdirectory
                  directory
                  class="media-file-input"
                  @change="handleFolderChange"
                />
                <div v-if="folderSelectionLabel" class="media-helper flex flex-wrap items-center gap-2">
                  <span>{{ folderSelectionLabel }}</span>
                  <button
                    type="button"
                    class="filter-pill text-[10px]"
                    @click="resetUploadState"
                  >
                    Clear folders
                  </button>
                </div>
                <p class="media-helper text-[11px] text-slate-400">
                  Select another folder to add more before uploading, or drag multiple folders below.
                </p>
                <div
                  class="mt-2 rounded-2xl border border-dashed px-4 py-4 text-xs text-slate-300 transition pointer-events-auto"
                  :class="dragActive ? 'border-cyan-300/80 bg-cyan-500/10 text-slate-100' : 'border-slate-700/70 bg-slate-900/40'"
                  @dragenter.prevent="handleDragOver"
                  @dragover.prevent="handleDragOver"
                  @dragleave.prevent="handleDragLeave"
                  @drop.prevent="handleDrop"
                >
                  Drop folders here (multi-folder supported)
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      class="filter-pill text-[10px]"
                      @click="openFolderPicker"
                    >
                      Add folder
                    </button>
                    <span class="text-[10px] text-slate-400">Click multiple times to add more folders.</span>
                  </div>
                </div>
                <div v-if="selectedFolderNames.length" class="mt-2 flex flex-wrap gap-2">
                  <span
                    v-for="name in selectedFolderNames"
                    :key="`folder-tag-${name}`"
                    class="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200"
                  >
                    {{ name }}
                    <button type="button" class="text-rose-200" @click="removeFolderSelection(name)">
                      ✕
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div class="media-uploader-actions">
              <div class="media-uploader-stack">
                <label class="media-checkbox">
                  <input v-model="convertToWebp" type="checkbox" />
                  {{ t("media.convert_webp") }}
                </label>
                <p v-if="uploadHint" class="media-helper">{{ uploadHint }}</p>
              </div>
              <button
                type="button"
                class="btn-primary text-xs px-3 py-1.5"
                :disabled="uploadDisabled"
                @click="handleUpload"
              >
                {{ uploadLoading ? t("media.uploading") : uploadButtonLabel }}
              </button>
            </div>

            <p v-if="uploadError" class="media-error">{{ uploadError }}</p>
            <p v-if="uploadSuccess" class="media-success">{{ uploadSuccess }}</p>
            <p v-if="itemsError" class="media-error">{{ itemsError }}</p>
          </div>

          <div class="media-controls">
            <div class="media-search">
              <span class="search-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="7"></circle>
                  <path d="M20 20l-3.5-3.5"></path>
                </svg>
              </span>
              <input
                v-model="query"
                type="text"
                :placeholder="t('media.search_images')"
                class="input-compact pl-9"
              />
            </div>
            <div class="media-controls-right">
              <select v-model="sortKey" class="select-compact">
                <option value="newest">{{ t("media.sort_newest") }}</option>
                <option value="oldest">{{ t("media.sort_oldest") }}</option>
                <option value="name">{{ t("media.sort_name") }}</option>
              </select>
              <div class="media-view-toggle">
                <button
                  type="button"
                  class="media-toggle"
                  :class="viewMode === 'grid' ? 'media-toggle-active' : ''"
                  @click="viewMode = 'grid'"
                >
                  {{ t("media.view_grid") }}
                </button>
                <button
                  type="button"
                  class="media-toggle"
                  :class="viewMode === 'list' ? 'media-toggle-active' : ''"
                  @click="viewMode = 'list'"
                >
                  {{ t("media.view_list") }}
                </button>
              </div>
              <button
                v-if="query"
                type="button"
                class="filter-pill text-[11px]"
                @click="query = ''"
              >
                {{ t("media.clear") }}
              </button>
            </div>
          </div>

          <div class="media-filter-row">
            <span class="media-filter-label">{{ t("media.source") }}</span>
            <button
              type="button"
              class="filter-pill"
              :class="sourceFilter === 'all' ? 'filter-pill-active' : ''"
              @click="sourceFilter = 'all'"
            >
              {{ t("media.filter_all") }}
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="sourceFilter === 'stored' ? 'filter-pill-active' : ''"
              @click="sourceFilter = 'stored'"
            >
              {{ t("media.filter_stored") }}
            </button>
            <button
              type="button"
              class="filter-pill"
              :class="sourceFilter === 'linked' ? 'filter-pill-active' : ''"
              @click="sourceFilter = 'linked'"
            >
              {{ t("media.filter_linked") }}
            </button>
          </div>

          <div class="media-filter-row">
            <span class="media-filter-label">{{ t("media.format") }}</span>
            <button
              type="button"
              class="filter-pill"
              :class="formatFilter === 'all' ? 'filter-pill-active' : ''"
              @click="formatFilter = 'all'"
            >
              {{ t("media.filter_all") }}
            </button>
            <button
              v-for="format in formatOptions"
              :key="format.format"
              type="button"
              class="filter-pill"
              :class="formatFilter === format.format ? 'filter-pill-active' : ''"
              @click="formatFilter = format.format"
            >
              {{ format.label }} {{ format.count }}
            </button>
          </div>

          <div class="media-filter-row">
            <span class="media-filter-label">{{ t("media.category") }}</span>
            <button
              type="button"
              class="filter-pill"
              :class="categoryFilter === 'all' ? 'filter-pill-active' : ''"
              @click="categoryFilter = 'all'"
            >
              {{ t("media.filter_all") }}
            </button>
            <button
              v-for="category in categoryOptions"
              :key="category.key"
              type="button"
              class="filter-pill"
              :class="categoryFilter === category.key ? 'filter-pill-active' : ''"
              @click="categoryFilter = category.key"
            >
              {{ category.label }} {{ category.count }}
            </button>
          </div>

          <div class="media-filter-row">
            <span class="media-filter-label">Folder</span>
            <select v-model="folderSelectValue" class="select-compact max-w-[18rem]">
              <option value="all">All</option>
              <option v-if="hasMultipleFolders" value="multiple" disabled>Multiple selected</option>
              <option v-for="folder in folderSelectOptions" :key="folder.name" :value="folder.name">
                {{ folder.name }} ({{ folder.count }})
              </option>
            </select>
            <input
              v-model="folderSearch"
              type="text"
              placeholder="Find folder"
              class="input-compact w-44 text-xs"
            />
            <span class="text-xs text-slate-400">
              {{ folderSelectOptions.length }} folder{{ folderSelectOptions.length === 1 ? "" : "s" }}
            </span>
            <span v-if="folderLoading" class="text-xs text-slate-400">Loading...</span>
            <span v-else-if="folderError" class="text-xs text-rose-200">{{ folderError }}</span>
            <span v-else-if="noisyFolderCount && !showNoisyFolders" class="text-xs text-slate-400">
              {{ noisyFolderCount }} hidden
            </span>
            <button
              v-if="activeFolder !== 'all'"
              type="button"
              class="filter-pill text-[11px]"
              @click="folderFilter = ['all']"
            >
              {{ t("media.clear") }}
            </button>
            <button
              type="button"
              class="filter-pill"
              :disabled="activeFolder === 'all' || hasMultipleFolders || bulkBusy"
              @click="openRenameFolder"
            >
              Rename folder
            </button>
            <button
              type="button"
              class="filter-pill text-rose-200"
              :disabled="folderDeleteDisabled"
              @click="deleteCurrentFolder"
            >
              Delete folder
            </button>
            <select
              v-model="selectedFoldersToDelete"
              class="select-compact max-w-[18rem] min-h-[8.5rem]"
              multiple
            >
              <option
                v-for="folder in folderDeleteOptions"
                :key="`delete-folder-${folder.name}`"
                :value="folder.name"
              >
                {{ folder.name }} ({{ folder.count }})
              </option>
            </select>
            <button
              type="button"
              class="filter-pill text-[11px]"
              :disabled="!folderDeleteOptions.length || bulkBusy"
              @click="selectedFoldersToDelete = folderDeleteOptions.map((folder) => folder.name)"
            >
              Select all folders
            </button>
            <button
              type="button"
              class="filter-pill text-[11px]"
              :disabled="!selectedFoldersToDelete.length || bulkBusy"
              @click="selectedFoldersToDelete = []"
            >
              Clear selected
            </button>
            <button
              type="button"
              class="filter-pill text-rose-200"
              :disabled="folderDeleteBySelectDisabled"
              @click="deleteSelectedFolder"
            >
              Delete selected folders ({{ selectedFoldersToDelete.length }})
            </button>
            <button
              type="button"
              class="filter-pill text-rose-200"
              :disabled="filteredDeleteDisabled"
              @click="deleteFilteredFiles"
            >
              Delete filtered files
            </button>
            <button
              v-if="noisyFolderCount"
              type="button"
              class="filter-pill text-[11px]"
              @click="showNoisyFolders = !showNoisyFolders"
            >
              {{ showNoisyFolders ? "Hide noisy" : "Show noisy" }}
            </button>
            <button
              v-if="folderSelectOptions.length > folderQuickLimit"
              type="button"
              class="filter-pill text-[11px]"
              @click="showAllFolderCards = !showAllFolderCards"
            >
              {{ showAllFolderCards ? "Show less" : `Show all (${folderSelectOptions.length})` }}
            </button>
          </div>

          <div v-if="folderSelectOptions.length" class="rounded-2xl border border-slate-800/70 bg-slate-950/35 p-3">
            <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p class="text-[10px] uppercase tracking-[0.3em] text-slate-500">Folder quick pick</p>
              <p class="text-xs text-slate-400">Sorted by most images</p>
            </div>
            <div class="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
              <button
                type="button"
                class="flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition"
                :class="
                  folderFilter.includes('all')
                    ? 'border-cyan-400/70 bg-cyan-500/15 text-slate-100'
                    : 'border-slate-700/80 bg-slate-900/40 text-slate-300 hover:border-cyan-400/40 hover:text-slate-100'
                "
                @click="toggleFolderFilter('all')"
              >
                <span class="truncate font-medium">All folders</span>
                <span class="ml-3 rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-200">
                  {{ folderTotalCount }}
                </span>
              </button>
              <button
                v-for="folder in folderCardOptions"
                :key="`card-${folder.name}`"
                type="button"
                class="flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition"
                :class="
                  isFolderSelected(folder.name)
                    ? 'border-cyan-400/70 bg-cyan-500/15 text-slate-100'
                    : 'border-slate-700/80 bg-slate-900/40 text-slate-300 hover:border-cyan-400/40 hover:text-slate-100'
                "
                :title="folder.name"
                @click="toggleFolderFilter(folder.name)"
              >
                <span class="truncate font-medium">{{ folder.name }}</span>
                <span class="ml-3 rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-200">
                  {{ folder.count }}
                </span>
              </button>
            </div>
          </div>

          <div v-if="selectionMode || selectedCount" class="media-bulk">
            <div class="media-bulk-left">
              <span class="media-bulk-count">{{ t("media.selected_count", { count: String(selectedCount) }) }}</span>
              <button type="button" class="filter-pill" @click="toggleSelectAll">
                {{ allFilteredSelected ? t("media.clear_selection") : t("media.select_all") }}
              </button>
              <button
                v-if="selectedCount"
                type="button"
                class="filter-pill"
                @click="clearSelection"
              >
                {{ t("media.clear") }}
              </button>
            </div>
            <div class="media-bulk-actions">
              <select
                v-model="importItemId"
                class="select-compact"
                :disabled="itemsLoading || !importItems.length"
              >
                <option value="" disabled>{{ t("media.select_item") }}</option>
                <option v-for="item in importItems" :key="item.id" :value="item.id">
                  {{ itemLabel(item) }}
                </option>
              </select>
              <select v-model="importMode" class="select-compact">
                <option value="linked">{{ t("media.import_linked") }}</option>
                <option value="stored">{{ t("media.import_stored") }}</option>
              </select>
              <button
                type="button"
                class="btn-ghost text-xs px-3 py-1.5"
                :disabled="bulkImportDisabled"
                @click="bulkImport"
              >
                {{ t("media.import") }}
              </button>
              <div class="media-bulk-divider"></div>
              <button
                type="button"
                class="btn-ghost text-xs px-3 py-1.5"
                :disabled="bulkConvertDisabled"
                @click="bulkConvert"
              >
                {{ t("media.convert") }}
              </button>
              <div class="media-bulk-divider"></div>
              <button
                type="button"
                class="btn-ghost text-xs px-3 py-1.5 text-rose-200"
                :disabled="bulkDeleteDisabled"
                @click="bulkDelete"
              >
                {{ t("media.delete") }}
              </button>
            </div>
            <span v-if="bulkBusy" class="media-bulk-message">{{ t("media.working") }}</span>
          </div>
          <p v-if="bulkError" class="media-bulk-error">{{ bulkError }}</p>
          <p v-if="bulkSuccess" class="media-bulk-success">{{ bulkSuccess }}</p>
        </div>

        <div class="compact-scroll">
          <div v-if="loading" class="grid gap-2 md:grid-cols-2">
            <div v-for="n in 6" :key="n" class="skeleton h-32"></div>
          </div>

          <div v-else-if="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <div v-else class="space-y-3">
            <div v-if="!canUseMedia" class="card border-dashed border-slate-700/60 p-4 text-xs text-slate-400">
              {{ t("media.sign_in_image") }}
            </div>

            <div
              v-else-if="filteredMedia.length"
              :class="viewMode === 'grid' ? 'media-grid stagger' : 'media-list'"
            >
              <article
                v-for="item in filteredMedia"
                :key="item.id"
                class="media-card"
                :class="viewMode === 'list' ? 'media-card-list' : ''"
              >
                <button
                  v-if="selectionMode"
                  type="button"
                  class="media-select"
                  :class="selectedSet.has(item.id) ? 'media-select-active' : ''"
                  @click="toggleSelect(item.id)"
                >
                  <span></span>
                </button>
                <div class="media-preview">
                  <img
                    v-if="item.previewUrl"
                    :src="item.previewUrl"
                    :srcset="buildSrcSet(item)"
                    sizes="(min-width: 1024px) 320px, 50vw"
                    :alt="item.alt || item.label || item.fileName"
                    loading="lazy"
                  />
                  <div v-else class="media-placeholder">{{ t("media.no_preview") }}</div>
                  <div class="media-actions">
                    <a
                      :href="item.displayUrl"
                      class="media-action"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {{ t("media.open") }}
                    </a>
                    <button
                      type="button"
                      class="media-action"
                      :disabled="!supportsClipboard"
                      @click="copyLink(item)"
                    >
                      {{ t("media.copy") }}
                    </button>
                  </div>
                </div>
                <div class="media-meta">
                  <div class="media-title-row">
                    <p class="text-sm font-semibold text-slate-100 truncate">
                      {{ item.label || item.fileName }}
                    </p>
                    <span class="media-format">{{ formatLabel(item.extension) }}</span>
                  </div>
                  <p class="compact-meta truncate">{{ item.fileName }}</p>
                  <p class="compact-meta truncate">{{ item.shortUrl || item.displayUrl }}</p>
                  <div class="media-meta-row">
                    <span>{{ item.source === 'stored' ? t("media.filter_stored") : t("media.filter_linked") }}</span>
                    <span>{{ formatDate(item.created_at) }}</span>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="card border-dashed border-slate-700/60 p-4 text-xs text-slate-400">
              {{ t("media.no_images") }}
            </div>

            <div v-if="hasMore" class="flex justify-center pt-2">
              <button
                type="button"
                class="btn-ghost text-xs px-4 py-2"
                :disabled="loadingMore"
                @click="loadMore"
              >
                {{ t("media.load_more") }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="folderRenameOpen" class="fixed inset-0 z-50">
          <div class="absolute inset-0 bg-slate-950/70" @click.self="folderRenameOpen = false"></div>
          <div class="relative mx-auto mt-24 w-[min(90vw,480px)] rounded-2xl border border-slate-800/60 bg-slate-900 p-6 shadow-2xl">
            <h3 class="text-lg font-semibold text-slate-100">Rename folder</h3>
            <p class="mt-1 text-sm text-slate-400">Rename the current folder and update all images.</p>
            <div class="mt-4 space-y-2">
              <label class="text-xs text-slate-500">New folder name</label>
              <input
                v-model="folderRenameValue"
                type="text"
                class="w-full rounded-lg border border-slate-700/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-100"
              />
            </div>
            <div class="mt-5 flex items-center justify-end gap-2">
              <button type="button" class="btn-ghost text-xs px-3 py-1.5" @click="folderRenameOpen = false">
                Cancel
              </button>
              <button
                type="button"
                class="btn-primary text-xs px-3 py-1.5"
                :disabled="folderRenameLoading"
                @click="renameFolder"
              >
                {{ folderRenameLoading ? "Renaming..." : "Rename" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { MediaAsset, MediaStats, MediaVariant, WorkspaceItem } from "~/types/db";

type SortKey = "newest" | "oldest" | "name";
type SourceFilter = "all" | "stored" | "linked";
type CategoryKey = "mini-excavator" | "forklift" | "road-roller" | "skid-steer" | "attachments";

type MediaCard = MediaAsset & {
  previewUrl: string;
  displayUrl: string;
  shortUrl: string;
  fileName: string;
  extension: string;
  variants: MediaVariant[];
};

const CATEGORY_DEFS: { key: CategoryKey; labelKey: string }[] = [
  { key: "mini-excavator", labelKey: "media.category.mini_excavator" },
  { key: "forklift", labelKey: "media.category.forklift" },
  { key: "road-roller", labelKey: "media.category.road_roller" },
  { key: "skid-steer", labelKey: "media.category.skid_steer" },
  { key: "attachments", labelKey: "media.category.attachments" }
];

const user = useSupabaseUser();
const runtimeConfig = useRuntimeConfig();
const devOwnerId = computed(() => runtimeConfig.public.devOwnerId || "");
const canUpload = computed(() => Boolean(user.value || devOwnerId.value));
const canUseMedia = computed(() => Boolean(user.value || devOwnerId.value));
const { listItems } = useItems();
const { listMedia, getStats, uploadMedia, convertWebp, deleteMedia, deleteFolder, importMedia } = useMediaVault();
const { t } = useLocale();

const media = ref<MediaCard[]>([]);
const stats = ref<MediaStats | null>(null);
const query = ref("");
const loading = ref(false);
const loadingMore = ref(false);
const errorMessage = ref("");
const viewMode = ref<"grid" | "list">("grid");
const sortKey = ref<SortKey>("newest");
const formatFilter = ref("all");
const sourceFilter = ref<SourceFilter>("all");
const categoryFilter = ref<"all" | CategoryKey>("all");
type FolderOption = { name: string; count: number; coverUrl: string | null };

const folderFilter = ref<string[]>(["all"]);
const folderOptions = ref<FolderOption[]>([]);
const folderLoading = ref(false);
const folderError = ref("");
const copyStatus = ref("");
const supportsClipboard = ref(false);
const selectionMode = ref(false);
const selectedIds = ref<string[]>([]);
const bulkDeleteLoading = ref(false);
const bulkImportLoading = ref(false);
const bulkConvertLoading = ref(false);
const bulkFolderDeleteLoading = ref(false);
const bulkFilteredDeleteLoading = ref(false);
const folderRenameOpen = ref(false);
const folderRenameValue = ref("");
const folderRenameLoading = ref(false);
const selectedFoldersToDelete = ref<string[]>([]);
const bulkError = ref("");
const bulkSuccess = ref("");
const importItemId = ref("");
const importMode = ref<"linked" | "stored">("linked");
const items = ref<WorkspaceItem[]>([]);
const itemsLoading = ref(false);
const itemsError = ref("");
const selectedFile = ref<File | null>(null);
const selectedFolderFiles = ref<File[]>([]);
const selectedFolderNames = ref<string[]>([]);
const folderRootPrefixes = ref<string[]>([]);
const uploadLabel = ref("");
const uploadCategory = ref("");
const uploadProductSlug = ref("");
const uploadProductId = ref("");
const uploadView = ref("");
const uploadKeySpec = ref("");
const uploadAlt = ref("");
const uploadTitle = ref("");
const uploadFolder = ref("");
const newFolderName = ref("");
const uploadLoading = ref(false);
const uploadError = ref("");
const uploadSuccess = ref("");
const convertToWebp = ref(true);
const fileInput = ref<HTMLInputElement | null>(null);
const folderInput = ref<HTMLInputElement | null>(null);
const dragActive = ref(false);
const supportsDirectoryPicker = computed(() =>
  typeof window !== "undefined" && typeof (window as any).showDirectoryPicker === "function"
);
const pageSize = 60;
const offset = ref(0);
const total = ref(0);
let mediaRequestToken = 0;
let statsRequestToken = 0;

const formatLabel = (value: string) => {
  if (!value) return "FILE";
  return value.toUpperCase();
};

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const fileNameFromUrl = (value: string) => {
  const cleaned = value.split("?")[0] || "";
  const parts = cleaned.split("/");
  return parts[parts.length - 1] || "media";
};

const mapMedia = (items: MediaAsset[]): MediaCard[] => {
  return items.map((item) => {
    const variants = (item.media_variants || []) as MediaVariant[];
    const thumb = variants.find((variant) => variant.variant === "thumb")
      || variants.find((variant) => variant.variant === "small");
    const displayUrl = item.public_url || item.external_url || "";
    const previewUrl = thumb?.public_url || displayUrl;
    const fileName = item.storage_path ? item.storage_path.split("/").pop() || "media" : fileNameFromUrl(displayUrl);
    return {
      ...item,
      previewUrl,
      displayUrl,
      shortUrl: item.short_url || "",
      fileName,
      extension: item.ext || fileName.split(".").pop() || "",
      variants
    } as MediaCard;
  });
};

const buildSrcSet = (item: MediaCard) => {
  const entries = item.variants
    .filter((variant) => ["small", "medium", "large"].includes(variant.variant) && variant.public_url && variant.width)
    .sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  if (!entries.length) return "";
  return entries.map((variant) => `${variant.public_url} ${variant.width}w`).join(", ");
};

const itemLabel = (item: WorkspaceItem) => {
  return item.sku ? `${item.title} - SKU ${item.sku}` : item.title;
};

const formatOptions = computed(() => {
  const counts = { ...(stats.value?.formatCounts ?? {}) } as Record<string, number>;
  if (stats.value?.webp && !counts.webp) {
    counts.webp = stats.value.webp;
  }
  return Object.entries(counts)
    .map(([format, count]) => ({
      format,
      label: format.toUpperCase(),
      count
    }))
    .sort((a, b) => b.count - a.count);
});

const categoryOptions = computed(() => {
  const counts = stats.value?.categoryCounts ?? {};
  return CATEGORY_DEFS.map((def) => ({
    key: def.key,
    label: t(def.labelKey),
    count: counts[def.key] ?? 0
  }));
});

const selectedSet = computed(() => new Set(selectedIds.value));
const selectedItems = computed(() => {
  const set = selectedSet.value;
  return media.value.filter((item) => set.has(item.id));
});
const selectedCount = computed(() => selectedIds.value.length);
const allFilteredSelected = computed(() => {
  if (!media.value.length) return false;
  const set = selectedSet.value;
  return media.value.every((item) => set.has(item.id));
});

const importItems = computed(() => items.value);
const filteredMedia = computed(() => media.value);

const lastUpdated = computed(() => {
  if (!stats.value?.updatedAt) return t("media.no_updates");
  return formatDate(stats.value.updatedAt);
});

const uploadDisabled = computed(() => {
  return (!selectedFile.value && selectedFolderFiles.value.length === 0) || uploadLoading.value;
});

const bulkBusy = computed(() => {
  return (
    bulkDeleteLoading.value ||
    bulkImportLoading.value ||
    bulkConvertLoading.value ||
    bulkFolderDeleteLoading.value ||
    bulkFilteredDeleteLoading.value
  );
});

const bulkDeleteDisabled = computed(() => {
  return !selectedCount.value || bulkBusy.value;
});

const folderDeleteDisabled = computed(() => {
  return activeFolder.value === "all" || hasMultipleFolders.value || bulkBusy.value;
});

const folderDeleteBySelectDisabled = computed(() => {
  return !selectedFoldersToDelete.value.length || bulkBusy.value;
});

const filteredDeleteDisabled = computed(() => {
  return !media.value.length || bulkBusy.value;
});

const bulkImportDisabled = computed(() => {
  return !importItemId.value || itemsLoading.value || bulkBusy.value;
});

const bulkConvertDisabled = computed(() => {
  return !selectedCount.value || bulkBusy.value;
});

const hasMore = computed(() => media.value.length < total.value);

const activeFolder = computed(() => {
  if (folderFilter.value.length === 1) {
    return folderFilter.value[0];
  }
  return "all";
});

const hasMultipleFolders = computed(() => {
  return false;
});

const folderQueryValue = computed(() => {
  return activeFolder.value;
});

const folderSelectValue = computed({
  get() {
    return hasMultipleFolders.value ? "multiple" : activeFolder.value;
  },
  set(value: string) {
    if (value === "multiple") return;
    folderFilter.value = [value];
  }
});

const uploadHint = computed(() => {
  if (selectedFolderFiles.value.length) {
    const count = selectedFolderFiles.value.length;
    const folders = selectedFolderNames.value.length;
    return `Selected ${count} image${count === 1 ? "" : "s"} from ${folders} folder${folders === 1 ? "" : "s"}.`;
  }
  if (!selectedFile.value) return "Choose a file or folder to upload.";
  return "";
});

const folderSelectionLabel = computed(() => {
  if (!selectedFolderFiles.value.length) return "";
  const count = selectedFolderFiles.value.length;
  const names = selectedFolderNames.value;
  if (names.length) {
    const list = names.slice(0, 3).join(", ");
    const suffix = names.length > 3 ? ` +${names.length - 3} more` : "";
    return `${count} image${count === 1 ? "" : "s"} from ${list}${suffix}`;
  }
  return `${count} image${count === 1 ? "" : "s"} selected`;
});

const uploadButtonLabel = computed(() => {
  if (selectedFolderFiles.value.length) {
    const folderCount = selectedFolderNames.value.length || 1;
    return folderCount > 1
      ? `Upload folders (${folderCount})`
      : `Upload folder (${selectedFolderFiles.value.length})`;
  }
  return t("media.upload_image");
});

const folderStorageKey = computed(() => {
  const key = categoryFilter.value === "all" ? "all" : categoryFilter.value;
  return `mediaFolders.image.${key}`;
});

const folderSearch = ref("");
const showNoisyFolders = ref(false);
const showEmptyFolders = ref(false);
const showAllFolderCards = ref(false);
const folderQuickLimit = 12;

const normalizeFolderSelection = (values: string[]) => {
  const cleaned = values.map((value) => value.trim()).filter(Boolean);
  const unique = Array.from(new Set(cleaned));
  if (!unique.length) return ["all"];
  if (unique.includes("all")) return ["all"];
  return unique;
};

const isNoisyFolderName = (value: string) => {
  const name = value.trim();
  if (!name) return true;
  if (name.includes("/") || name.includes("\\")) return true;
  if (/\.(webp|png|jpe?g|gif|bmp|tiff?|svg|avif|heic|mp4|webm|mov)$/i.test(name)) return true;
  return false;
};

const noisyFolderCount = computed(() => folderOptions.value.filter((folder) => isNoisyFolderName(folder.name)).length);

const folderSelectOptions = computed(() => {
  const selected = new Set(folderFilter.value.filter((value) => value !== "all"));
  const term = folderSearch.value.trim().toLowerCase();
  return folderOptions.value.filter((folder) => {
    const noisy = isNoisyFolderName(folder.name);
    if (!showNoisyFolders.value && noisy && !selected.has(folder.name)) {
      return false;
    }
    if (!showEmptyFolders.value && folder.count <= 0 && !selected.has(folder.name)) {
      return false;
    }
    if (!term) return true;
    return folder.name.toLowerCase().includes(term);
  });
});

const folderTotalCount = computed(() => {
  return folderSelectOptions.value.reduce((sum, folder) => sum + (Number(folder.count) || 0), 0);
});

const folderCardOptions = computed(() => {
  const selected = new Set(folderFilter.value.filter((value) => value !== "all"));
  const sorted = [...folderSelectOptions.value].sort((a, b) => {
    const selectedDelta = Number(selected.has(b.name)) - Number(selected.has(a.name));
    if (selectedDelta !== 0) return selectedDelta;
    const countDelta = (Number(b.count) || 0) - (Number(a.count) || 0);
    if (countDelta !== 0) return countDelta;
    return a.name.localeCompare(b.name);
  });

  if (showAllFolderCards.value) return sorted;
  const sliced = sorted.slice(0, folderQuickLimit);
  if (activeFolder.value === "all" || sliced.some((folder) => folder.name === activeFolder.value)) {
    return sliced;
  }
  const active = sorted.find((folder) => folder.name === activeFolder.value);
  if (!active) return sliced;
  return [active, ...sliced.slice(0, Math.max(folderQuickLimit - 1, 0))];
});

const folderDeleteOptions = computed(() => {
  return [...folderOptions.value]
    .filter((folder) => folder.name && folder.name !== "all")
    .sort((a, b) => {
      const countDelta = (Number(b.count) || 0) - (Number(a.count) || 0);
      if (countDelta !== 0) return countDelta;
      return a.name.localeCompare(b.name);
    });
});

const saveFolderOptions = () => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      folderStorageKey.value,
      JSON.stringify(
        folderOptions.value
          .map((folder) => folder.name)
          .filter((name) => !isNoisyFolderName(name))
      )
    );
  } catch {
    // ignore
  }
};

const loadFolderOptions = async () => {
  if (!canUseMedia.value) return;
  folderLoading.value = true;
  folderError.value = "";

  let stored: FolderOption[] = [];
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(folderStorageKey.value);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          stored = parsed
            .filter((item) => typeof item === "string")
            .map((name: string) => ({ name, count: 0, coverUrl: null }));
        }
      }
    } catch {
      stored = [];
    }
  }

  let remote: FolderOption[] = [];
  try {
    const response = await $fetch<{ items: FolderOption[] }>("/api/media/folders", {
      query: {
        kind: "image",
        category: categoryFilter.value === "all" ? undefined : categoryFilter.value
      }
    });
    remote = response.items || [];
  } catch (error) {
    const err = error as Error;
    folderError.value = err.message || t("media.failed_load_images");
  }

  const merged = new Map<string, FolderOption>();
  for (const item of stored) {
    merged.set(item.name, item);
  }
  for (const item of remote) {
    merged.set(item.name, item);
  }

  folderOptions.value = Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
  const available = new Set(folderOptions.value.map((folder) => folder.name));
  folderFilter.value = normalizeFolderSelection(
    folderFilter.value.filter((name) => name === "all" || available.has(name))
  );
  if (selectedFoldersToDelete.value.length) {
    selectedFoldersToDelete.value = selectedFoldersToDelete.value.filter((name) => available.has(name));
  }
  folderLoading.value = false;
};

const addFolder = () => {
  const name = newFolderName.value.trim();
  if (!name) return;
  if (!folderOptions.value.find((folder) => folder.name === name)) {
    folderOptions.value = [...folderOptions.value, { name, count: 0, coverUrl: null }].sort(
      (a, b) => a.name.localeCompare(b.name)
    );
    saveFolderOptions();
  }
  uploadFolder.value = name;
  newFolderName.value = "";
};

const isFolderSelected = (name: string) => {
  return folderFilter.value.includes(name);
};

const toggleFolderFilter = (name: string) => {
  if (name === "all") {
    folderFilter.value = ["all"];
    return;
  }
  folderFilter.value = [name];
};

const openRenameFolder = () => {
  if (activeFolder.value === "all" || hasMultipleFolders.value) return;
  folderRenameValue.value = activeFolder.value;
  folderRenameOpen.value = true;
};

const renameFolder = async () => {
  const nextName = folderRenameValue.value.trim();
  if (!nextName || nextName === activeFolder.value) {
    folderRenameOpen.value = false;
    return;
  }

  folderRenameLoading.value = true;
  resetBulkStatus();

  try {
    const response = await $fetch<{ updated: number }>("/api/media/rename-folder", {
      method: "POST",
      body: {
        kind: "image",
        category: categoryFilter.value === "all" ? undefined : categoryFilter.value,
        fromFolder: activeFolder.value,
        toFolder: nextName
      }
    });
    bulkSuccess.value = `Renamed folder and updated ${response.updated || 0} images.`;
    folderFilter.value = [nextName];
    await loadFolderOptions();
    await refreshMedia();
  } catch (error) {
    const err = error as Error;
    bulkError.value = err.message || "Failed to rename folder.";
  } finally {
    folderRenameLoading.value = false;
    folderRenameOpen.value = false;
  }
};

const resetBulkStatus = () => {
  bulkError.value = "";
  bulkSuccess.value = "";
};

const clearSelection = () => {
  selectedIds.value = [];
};

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value;
  resetBulkStatus();
  if (!selectionMode.value) {
    clearSelection();
  }
};

const toggleSelect = (id: string) => {
  resetBulkStatus();
  if (selectedSet.value.has(id)) {
    selectedIds.value = selectedIds.value.filter((value) => value !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
};

const toggleSelectAll = () => {
  resetBulkStatus();
  if (allFilteredSelected.value) {
    clearSelection();
    return;
  }
  selectedIds.value = media.value.map((item) => item.id);
};

const resetUploadState = () => {
  selectedFile.value = null;
  selectedFolderFiles.value = [];
  selectedFolderNames.value = [];
  folderRootPrefixes.value = [];
  uploadLabel.value = "";
  uploadAlt.value = "";
  uploadTitle.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  if (folderInput.value) {
    folderInput.value.value = "";
  }
};

const setCopyStatus = (message: string) => {
  copyStatus.value = message;
  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      copyStatus.value = "";
    }, 2000);
  }
};

const copyLinks = async () => {
  const itemsToCopy = selectedCount.value ? selectedItems.value : media.value;
  if (!itemsToCopy.length) {
    setCopyStatus(t("media.copy_links_empty"));
    return;
  }
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    setCopyStatus(t("media.clipboard_unavailable"));
    return;
  }

  try {
    const payload = itemsToCopy
      .map((item) => `${item.shortUrl || ""} | ${item.displayUrl || ""} | ${item.alt || item.label || ""}`)
      .join("\n");
    await navigator.clipboard.writeText(payload);
    setCopyStatus(t("media.copy_links_selected", { count: String(itemsToCopy.length) }));
  } catch (error) {
    setCopyStatus(t("media.copy_failed"));
  }
};

const copyLink = async (item: MediaCard) => {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    setCopyStatus(t("media.clipboard_unavailable"));
    return;
  }

  try {
    await navigator.clipboard.writeText(item.shortUrl || item.displayUrl || "");
    setCopyStatus(t("media.link_copied"));
  } catch (error) {
    setCopyStatus(t("media.copy_failed"));
  }
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  selectedFile.value = file;
  selectedFolderFiles.value = [];
  selectedFolderNames.value = [];
  folderRootPrefixes.value = [];
  if (folderInput.value) {
    folderInput.value.value = "";
  }
  uploadError.value = "";
  uploadSuccess.value = "";
  if (file && !uploadLabel.value) {
    uploadLabel.value = file.name;
  }
};

const getPathSegments = (file: File) => {
  const relPath = (file as any).webkitRelativePath || "";
  if (!relPath) return [file.name];
  return relPath.split("/").filter(Boolean);
};

const getFolderNameFromFile = (file: File) => {
  const segments = getPathSegments(file);
  if (!segments.length) return "";
  const root = segments[0];
  if (folderRootPrefixes.value.includes(root) && segments.length > 1) {
    return segments[1];
  }
  return root;
};

const appendRelativePath = (file: File, path: string) => {
  if (!path) return;
  if (!(file as any).webkitRelativePath) {
    (file as any).webkitRelativePath = path.replace(/^\//, "");
  }
};

const collectFromDirectoryHandle = async (handle: any, basePath: string, files: File[]) => {
  for await (const [name, entry] of handle.entries()) {
    if (entry.kind === "file") {
      const file = await entry.getFile();
      appendRelativePath(file, `${basePath}/${name}`);
      files.push(file);
    } else if (entry.kind === "directory") {
      await collectFromDirectoryHandle(entry, `${basePath}/${name}`, files);
    }
  }
};

const mergeFolderSelection = (files: File[]) => {
  const existingKeys = new Set(
    selectedFolderFiles.value.map((file) => `${(file as any).webkitRelativePath || file.name}-${file.size}`)
  );
  const mergedFiles: File[] = [...selectedFolderFiles.value];
  const names = new Set(selectedFolderNames.value);

  const segmentsList = files.map((file) => getPathSegments(file));
  const roots = new Set(segmentsList.map((segments) => segments[0]).filter(Boolean));
  if (roots.size === 1) {
    const [root] = Array.from(roots.values());
    const secondSegments = new Set(
      segmentsList.map((segments) => segments[1]).filter((value) => typeof value === "string" && value.length)
    );
    if (secondSegments.size > 1 && !folderRootPrefixes.value.includes(root)) {
      folderRootPrefixes.value = [...folderRootPrefixes.value, root];
    }
  }

  for (const file of files) {
    const key = `${(file as any).webkitRelativePath || file.name}-${file.size}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    mergedFiles.push(file);
    const folderName = getFolderNameFromFile(file);
    if (folderName) names.add(folderName);
  }

  selectedFolderFiles.value = mergedFiles;
  selectedFolderNames.value = Array.from(names.values()).sort((a, b) => a.localeCompare(b));
};

const removeFolderSelection = (name: string) => {
  const remainingFiles = selectedFolderFiles.value.filter(
    (file) => getFolderNameFromFile(file) !== name
  );
  selectedFolderFiles.value = remainingFiles;
  selectedFolderNames.value = selectedFolderNames.value.filter((folder) => folder !== name);
  if (!selectedFolderNames.value.length) {
    folderRootPrefixes.value = [];
    uploadFolder.value = "";
  }
};

const handleFolderChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files ?? []).filter((file) => {
    if (file.type) return file.type.startsWith("image/");
    return /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(file.name);
  });
  if (!files.length) return;

  mergeFolderSelection(files);
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  uploadError.value = "";
  uploadSuccess.value = "";

  selectedFolderNames.value.forEach((folderName) => {
    if (!folderOptions.value.find((folder) => folder.name === folderName)) {
      folderOptions.value = [...folderOptions.value, { name: folderName, count: 0, coverUrl: null }].sort(
        (a, b) => a.name.localeCompare(b.name)
      );
      saveFolderOptions();
    }
  });

  if (!uploadFolder.value && selectedFolderNames.value.length === 1) {
    uploadFolder.value = selectedFolderNames.value[0];
  }

  if (files.length && !uploadLabel.value) {
    uploadLabel.value = selectedFolderNames.value[0] || "Folder upload";
  }

  if (folderInput.value) {
    folderInput.value.value = "";
  }
};

const traverseEntry = async (entry: any, files: File[]) => {
  if (!entry) return;
  if (entry.isFile) {
    await new Promise<void>((resolve) => {
      entry.file((file: File) => {
        appendRelativePath(file, entry.fullPath || "");
        files.push(file);
        resolve();
      });
    });
    return;
  }
  if (entry.isDirectory) {
    const reader = entry.createReader();
    const readEntries = () =>
      new Promise<any[]>((resolve) => {
        reader.readEntries((entries: any[]) => resolve(entries));
      });
    let entries = await readEntries();
    while (entries.length) {
      for (const child of entries) {
        await traverseEntry(child, files);
      }
      entries = await readEntries();
    }
  }
};

const handleDragOver = (event?: DragEvent) => {
  dragActive.value = true;
  if (event?.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }
};

const handleDragLeave = () => {
  dragActive.value = false;
};

const handleDrop = async (event: DragEvent) => {
  dragActive.value = false;
  const files: File[] = [];
  const dataTransfer = event.dataTransfer;
  const items = dataTransfer?.items;

  if (items && items.length) {
    for (const item of Array.from(items)) {
      const entry = (item as any).webkitGetAsEntry?.();
      if (entry) {
        await traverseEntry(entry, files);
        continue;
      }
      const file = item.getAsFile?.();
      if (file) files.push(file);
    }
  }

  if (dataTransfer?.files?.length) {
    for (const file of Array.from(dataTransfer.files)) {
      files.push(file);
    }
  }

  const uniqueFiles = new Map<string, File>();
  for (const file of files) {
    const rel = (file as any).webkitRelativePath || file.name;
    const key = `${rel}-${file.size}`;
    if (!uniqueFiles.has(key)) {
      uniqueFiles.set(key, file);
    }
  }

  const imageFiles = Array.from(uniqueFiles.values()).filter((file) => {
    if (file.type) return file.type.startsWith("image/");
    return /\.(png|jpe?g|webp|gif|bmp|tiff?)$/i.test(file.name);
  });
  if (!imageFiles.length) return;

  mergeFolderSelection(imageFiles);
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  uploadError.value = "";
  uploadSuccess.value = "";

  selectedFolderNames.value.forEach((folderName) => {
    if (!folderOptions.value.find((folder) => folder.name === folderName)) {
      folderOptions.value = [...folderOptions.value, { name: folderName, count: 0, coverUrl: null }].sort(
        (a, b) => a.name.localeCompare(b.name)
      );
      saveFolderOptions();
    }
  });

  if (!uploadFolder.value && selectedFolderNames.value.length === 1) {
    uploadFolder.value = selectedFolderNames.value[0];
  }
};

const pickFolder = async () => {
  if (!supportsDirectoryPicker.value) {
    folderInput.value?.click();
    return;
  }
  try {
    const handle = await (window as any).showDirectoryPicker();
    const files: File[] = [];
    await collectFromDirectoryHandle(handle, handle.name, files);
    if (!files.length) return;
    mergeFolderSelection(files);
    selectedFile.value = null;
    if (fileInput.value) {
      fileInput.value.value = "";
    }
    uploadError.value = "";
    uploadSuccess.value = "";

    selectedFolderNames.value.forEach((folderName) => {
      if (!folderOptions.value.find((folder) => folder.name === folderName)) {
        folderOptions.value = [...folderOptions.value, { name: folderName, count: 0, coverUrl: null }].sort(
          (a, b) => a.name.localeCompare(b.name)
        );
        saveFolderOptions();
      }
    });

    if (!uploadFolder.value && selectedFolderNames.value.length === 1) {
      uploadFolder.value = selectedFolderNames.value[0];
    }

    if (files.length && !uploadLabel.value) {
      uploadLabel.value = selectedFolderNames.value[0] || "Folder upload";
    }
  } catch (error) {
    folderInput.value?.click();
  }
};

const openFolderPicker = async () => {
  await pickFolder();
};

const loadStats = async () => {
  const requestToken = ++statsRequestToken;
  try {
    const nextStats = await getStats("image");
    if (requestToken !== statsRequestToken) return;
    stats.value = nextStats;
  } catch (error) {
    if (requestToken !== statsRequestToken) return;
    const err = error as Error;
    errorMessage.value = err.message || t("media.failed_load_images");
  }
};

const loadMedia = async (reset = true) => {
  if (!canUseMedia.value) return;
  const requestToken = ++mediaRequestToken;
  if (reset) {
    loading.value = true;
    offset.value = 0;
    media.value = [];
    total.value = 0;
  } else {
    loadingMore.value = true;
  }
  errorMessage.value = "";

  try {
    const response = await listMedia({
      kind: "image",
      source: sourceFilter.value,
      format: formatFilter.value,
      category: categoryFilter.value,
      folder: folderQueryValue.value,
      search: query.value,
      sort: sortKey.value,
      limit: pageSize,
      offset: reset ? 0 : offset.value
    });

    if (requestToken !== mediaRequestToken) return;
    const mapped = mapMedia(response.items);
    media.value = reset ? mapped : [...media.value, ...mapped];
    total.value = response.total;
    offset.value = media.value.length;
  } catch (error) {
    if (requestToken !== mediaRequestToken) return;
    const err = error as Error;
    errorMessage.value = err.message || t("media.failed_load_images");
  } finally {
    if (requestToken !== mediaRequestToken) return;
    loading.value = false;
    loadingMore.value = false;
  }
};

const refreshMedia = async () => {
  await Promise.all([loadMedia(true), loadStats()]);
};

const loadMore = async () => {
  if (!hasMore.value) return;
  await loadMedia(false);
};

const handleUpload = async () => {
  const hasFolder = selectedFolderFiles.value.length > 0;
  if (!selectedFile.value && !hasFolder) {
    uploadError.value = t("media.choose_file_first");
    uploadSuccess.value = "";
    return;
  }

  uploadLoading.value = true;
  uploadError.value = "";
  uploadSuccess.value = "";

  const resolvedCategory = uploadCategory.value || (categoryFilter.value === "all" ? "" : categoryFilter.value);
  const uploadedFolderNames = uploadFolder.value
    ? [uploadFolder.value]
    : selectedFolderNames.value;
  const filesToUpload = hasFolder ? selectedFolderFiles.value : selectedFile.value ? [selectedFile.value] : [];
  let uploadedCount = 0;
  let existingCount = 0;
  let failedCount = 0;

  try {
    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("kind", "image");
      if (resolvedCategory) formData.append("category", resolvedCategory);
      if (uploadProductSlug.value) formData.append("productSlug", uploadProductSlug.value);
      if (uploadProductId.value) formData.append("productId", uploadProductId.value);
      const folderFromFile = uploadFolder.value || getFolderNameFromFile(file);
      if (folderFromFile) formData.append("folder", folderFromFile);
      if (uploadView.value) formData.append("view", uploadView.value);
      if (uploadKeySpec.value) formData.append("keySpec", uploadKeySpec.value);

      const label = hasFolder
        ? uploadLabel.value
          ? `${uploadLabel.value} ${file.name}`
          : file.name
        : uploadLabel.value;
      const alt = hasFolder
        ? uploadAlt.value || file.name.replace(/\.[^.]+$/, "")
        : uploadAlt.value;
      const title = hasFolder
        ? uploadTitle.value || file.name.replace(/\.[^.]+$/, "")
        : uploadTitle.value;

      if (label) formData.append("label", label);
      if (alt) formData.append("alt", alt);
      if (title) formData.append("title", title);
      formData.append("convertToWebp", convertToWebp.value ? "true" : "false");
      formData.append("file", file);

      try {
        const response = await uploadMedia(formData);
        if (response?.existing) {
          existingCount += 1;
        } else {
          uploadedCount += 1;
        }
      } catch {
        failedCount += 1;
      }
    }

    if (uploadedCount) {
      uploadSuccess.value = `Uploaded ${uploadedCount} image${uploadedCount === 1 ? "" : "s"}.`;
    } else if (!failedCount && existingCount) {
      uploadSuccess.value = "Images already exist in Media Vault.";
    }
    if (existingCount) {
      uploadSuccess.value = `${uploadSuccess.value} ${existingCount} already existed.`;
    }
    if (failedCount) {
      uploadError.value = `Failed to upload ${failedCount} image${failedCount === 1 ? "" : "s"}.`;
    }
    resetUploadState();
    await loadFolderOptions();
    if (uploadedFolderNames.length) {
      folderFilter.value = normalizeFolderSelection(uploadedFolderNames);
    }
    await refreshMedia();
  } catch (error) {
    const err = error as Error;
    uploadError.value = err.message || t("media.failed_upload_image");
  } finally {
    uploadLoading.value = false;
  }
};

const bulkDelete = async () => {
  if (!selectedItems.value.length) return;
  if (typeof window !== "undefined") {
    const confirmDelete = window.confirm(
      t("media.confirm_delete_images", { count: String(selectedItems.value.length) })
    );
    if (!confirmDelete) return;
  }

  bulkDeleteLoading.value = true;
  resetBulkStatus();

  try {
    await deleteMedia(selectedItems.value.map((item) => item.id));
    bulkSuccess.value = t("media.deleted_items", { count: String(selectedItems.value.length) });
    clearSelection();
    await refreshMedia();
  } catch (error) {
    const err = error as Error;
    bulkError.value = err.message || t("media.failed_delete_selection");
  } finally {
    bulkDeleteLoading.value = false;
  }
};

const bulkImport = async () => {
  if (!importItemId.value) {
    bulkError.value = t("media.select_destination");
    return;
  }

  bulkImportLoading.value = true;
  resetBulkStatus();

  try {
    const response = await importMedia({
      kind: "image",
      productId: importItemId.value,
      assetIds: selectedIds.value,
      mode: importMode.value
    });

    const count = response.created || response.updated || selectedIds.value.length || 0;
    bulkSuccess.value = t("media.imported_items", { count: String(count) });
    clearSelection();
    await refreshMedia();
  } catch (error) {
    const err = error as Error;
    bulkError.value = err.message || t("media.failed_import");
  } finally {
    bulkImportLoading.value = false;
  }
};

const bulkConvert = async () => {
  if (!selectedItems.value.length) return;
  bulkConvertLoading.value = true;
  resetBulkStatus();

  try {
    const response = await convertWebp(selectedItems.value.map((item) => item.id));
    bulkSuccess.value = t("media.converted_items", { count: String(response.updated || 0) });
    if (response.skipped) {
      bulkError.value = t("media.failed_convert_items", { count: String(response.skipped) });
    }
    await refreshMedia();
  } catch (error) {
    const err = error as Error;
    bulkError.value = err.message || t("media.failed_convert");
  } finally {
    bulkConvertLoading.value = false;
  }
};

const deleteCurrentFolder = async () => {
  if (activeFolder.value === "all" || hasMultipleFolders.value) return;
  if (typeof window !== "undefined") {
    const confirmDelete = window.confirm(
      `Delete folder "${activeFolder.value}" and all images inside?`
    );
    if (!confirmDelete) return;
  }

  bulkFolderDeleteLoading.value = true;
  resetBulkStatus();

  try {
    const response = await deleteFolder({
      kind: "image",
      folder: activeFolder.value,
      category: categoryFilter.value === "all" ? undefined : categoryFilter.value
    });
    bulkSuccess.value = `Deleted ${response.deleted || 0} images in folder.`;
    folderFilter.value = ["all"];
    clearSelection();
    await loadFolderOptions();
    await refreshMedia();
  } catch (error) {
    const err = error as Error;
    bulkError.value = err.message || t("media.failed_delete_selection");
  } finally {
    bulkFolderDeleteLoading.value = false;
  }
};

const deleteSelectedFolder = async () => {
  const folderNames = Array.from(
    new Set(selectedFoldersToDelete.value.map((name) => name.trim()).filter(Boolean))
  );
  if (!folderNames.length) return;

  const preview = folderNames.slice(0, 3).join(", ");
  const suffix = folderNames.length > 3 ? ` +${folderNames.length - 3} more` : "";

  if (typeof window !== "undefined") {
    const confirmDelete = window.confirm(
      `Delete ${folderNames.length} folder${folderNames.length === 1 ? "" : "s"} and all images inside?\n${preview}${suffix}`
    );
    if (!confirmDelete) return;
  }

  bulkFolderDeleteLoading.value = true;
  resetBulkStatus();

  try {
    let deleted = 0;
    const failed: string[] = [];

    for (const folderName of folderNames) {
      try {
        const response = await deleteFolder({
          kind: "image",
          folder: folderName,
          category: categoryFilter.value === "all" ? undefined : categoryFilter.value
        });
        deleted += response.deleted || 0;
        if (activeFolder.value === folderName) {
          folderFilter.value = ["all"];
        }
      } catch {
        failed.push(folderName);
      }
    }

    const successCount = folderNames.length - failed.length;
    bulkSuccess.value = successCount
      ? `Deleted ${deleted} image${deleted === 1 ? "" : "s"} from ${successCount} folder${successCount === 1 ? "" : "s"}.`
      : "";
    if (failed.length) {
      bulkError.value = `Failed to delete ${failed.length} folder${failed.length === 1 ? "" : "s"}: ${failed.join(", ")}`;
    }
    selectedFoldersToDelete.value = failed;
    clearSelection();
    await loadFolderOptions();
    await refreshMedia();
  } catch (error) {
    const err = error as Error;
    bulkError.value = err.message || t("media.failed_delete_selection");
  } finally {
    bulkFolderDeleteLoading.value = false;
  }
};

const deleteFilteredFiles = async () => {
  if (!media.value.length) return;
  if (typeof window !== "undefined") {
    const confirmDelete = window.confirm("Delete all images in the current filter?");
    if (!confirmDelete) return;
  }

  bulkFilteredDeleteLoading.value = true;
  resetBulkStatus();

  try {
    const ids: string[] = [];
    let offsetValue = 0;
    let totalCount = 0;
    const limit = 200;

    do {
      const response = await listMedia({
        kind: "image",
        source: sourceFilter.value,
        format: formatFilter.value,
        category: categoryFilter.value,
        folder: folderQueryValue.value,
        search: query.value,
        sort: sortKey.value,
        limit,
        offset: offsetValue
      });

      ids.push(...response.items.map((item) => item.id));
      totalCount = response.total;
      offsetValue += response.limit;
    } while (ids.length < totalCount);

    const chunkSize = 100;
    let deleted = 0;
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const result = await deleteMedia(chunk);
      deleted += result.deleted || chunk.length;
    }

    bulkSuccess.value = `Deleted ${deleted} images in current filter.`;
    clearSelection();
    await loadFolderOptions();
    await refreshMedia();
  } catch (error) {
    const err = error as Error;
    bulkError.value = err.message || t("media.failed_delete_selection");
  } finally {
    bulkFilteredDeleteLoading.value = false;
  }
};

const loadItems = async () => {
  if (!canUseMedia.value) return;
  itemsLoading.value = true;
  itemsError.value = "";

  try {
    items.value = await listItems();
  } catch (error) {
    const err = error as Error;
    itemsError.value = err.message || t("media.failed_load_items");
  } finally {
    itemsLoading.value = false;
  }
};

let searchTimer: ReturnType<typeof setTimeout> | null = null;

watch(query, () => {
  if (searchTimer) window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    refreshMedia();
  }, 300);
});

watch([sourceFilter, formatFilter, categoryFilter, folderFilter, sortKey], () => {
  refreshMedia();
});

watch(categoryFilter, () => {
  folderFilter.value = ["all"];
  loadFolderOptions();
});

watch(user, () => {
  refreshMedia();
  loadItems();
  loadFolderOptions();
});

watch(media, () => {
  const ids = new Set(media.value.map((item) => item.id));
  selectedIds.value = selectedIds.value.filter((id) => ids.has(id));
});

const onWindowDragOver = (event: DragEvent) => {
  if (!event.dataTransfer) return;
  event.preventDefault();
  dragActive.value = true;
  event.dataTransfer.dropEffect = "copy";
};

const onWindowDragLeave = () => {
  dragActive.value = false;
};

const onWindowDrop = async (event: DragEvent) => {
  event.preventDefault();
  await handleDrop(event);
};

onMounted(() => {
  supportsClipboard.value = typeof navigator !== "undefined" && !!navigator.clipboard;
  refreshMedia();
  loadItems();
  loadFolderOptions();

  if (typeof window !== "undefined") {
    window.addEventListener("dragover", onWindowDragOver);
    window.addEventListener("dragleave", onWindowDragLeave);
    window.addEventListener("drop", onWindowDrop);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("dragover", onWindowDragOver);
    window.removeEventListener("dragleave", onWindowDragLeave);
    window.removeEventListener("drop", onWindowDrop);
  }
});
</script>
