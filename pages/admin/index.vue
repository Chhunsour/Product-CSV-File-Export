<template>
  <section class="page-shell page-admin">
    <div class="page-surface">
      <div class="compact-shell">
        <div class="panel compact-panel">
        <div class="compact-header">
        <div class="compact-header-title">
          <h1 class="section-title">{{ t("admin.title") }}</h1>
          <p class="section-subtitle">{{ t("admin.subtitle") }}</p>
        </div>
        <div class="compact-header-actions">
          <div class="compact-actions text-xs">
            <select v-model="imageSeparator" class="select-compact">
              <option value="auto">Images: Auto</option>
              <option value="pipe">Images: Woo (|)</option>
              <option value="comma">Images: Comma (,)</option>
            </select>
            <span v-if="imageSeparatorWarning" class="text-[11px] text-amber-200">
              {{ imageSeparatorWarning }}
            </span>
            <button
              type="button"
              class="btn-ghost text-xs px-3 py-1.5"
              :disabled="exporting"
              @click="handleExport"
            >
              {{ exporting ? t("admin.exporting") : t("admin.export_csv") }}
            </button>
            <button
              type="button"
              class="btn-ghost text-xs px-3 py-1.5"
              :disabled="importing"
              @click="triggerImport"
            >
              {{ importing ? t("admin.importing") : t("admin.import_csv") }}
            </button>
            <button type="button" class="btn-ghost text-xs px-3 py-1.5" @click="toggleTextCsv">
              {{ t("admin.text_to_csv") }}
            </button>
            <button
              type="button"
              class="btn-ghost text-xs px-3 py-1.5"
              @click="toggleSelectionMode"
            >
              {{ selectionMode ? t("admin.done") : t("admin.select") }}
            </button>
            <NuxtLink :to="{ path: '/admin/new', query: { folder: csvFolder } }" class="btn-primary text-xs px-3 py-1.5">
              {{ t("admin.new_item") }}
            </NuxtLink>
          </div>
        </div>
      </div>
      <input
        ref="importInput"
        type="file"
        accept=".csv,text/csv"
        class="hidden"
        @change="handleImportFile"
      />

      <div class="overview-banner">
          <div class="overview-main">
          <div>
            <h2 class="overview-title section-title-sm">{{ t("admin.operational_status") }}</h2>
            <p class="overview-update">
              {{ t("admin.last_update") }}
              <span class="overview-highlight">{{ latestUpdatedLabel }}</span>
            </p>
          </div>
          <div class="overview-metrics">
            <div class="overview-metric">
              <span>{{ t("admin.published") }}</span>
              <strong>{{ publishedCount }}</strong>
            </div>
            <div class="overview-metric">
              <span>{{ t("admin.drafts") }}</span>
              <strong>{{ draftCount }}</strong>
            </div>
            <div class="overview-metric">
              <span>{{ t("admin.private") }}</span>
              <strong>{{ privateCount }}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="panel compact-panel mt-3 folder-panel">
        <div class="folder-panel-inner">
          <div class="folder-panel-left">
            <div class="folder-panel-head">
              <div class="folder-panel-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z" />
                </svg>
              </div>
              <div>
                <h2 class="folder-panel-title section-title-sm">{{ t("admin.csv_workspaces") }}</h2>
                <p class="folder-panel-subtitle section-subtitle">{{ t("admin.csv_help") }}</p>
              </div>
            </div>
            <div class="folder-active-card">
              <span class="folder-active-kicker">{{ t("admin.active_workspace") }}</span>
              <strong class="folder-active-name">{{ csvFolder }}</strong>
              <span class="folder-active-meta">{{ folderCounts[csvFolder] ?? 0 }} {{ t("admin.items") }}</span>
            </div>
          </div>
          <div class="folder-panel-right">
            <div class="folder-board">
              <button
                v-for="folder in csvFolders"
                :key="folder"
                type="button"
                :class="['folder-card', csvFolder === folder && 'folder-card-active']"
                :aria-pressed="csvFolder === folder"
                @click="csvFolder = folder"
              >
                <span class="folder-card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z" />
                  </svg>
                </span>
                <span class="folder-card-name">{{ folder }}</span>
                <span class="folder-card-meta">{{ folderCounts[folder] ?? 0 }} {{ t("admin.items") }}</span>
                <span v-if="csvFolder === folder" class="folder-card-tag">{{ t("admin.active_workspace") }}</span>
              </button>
            </div>
            <div class="folder-panel-actions">
              <button type="button" class="btn-ghost folder-action" @click="openFolderDialog('add')">
                <span class="folder-action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                {{ t("admin.new_folder") }}
              </button>
              <button type="button" class="btn-ghost folder-action" @click="openFolderDialog('duplicate', csvFolder)">
                <span class="folder-action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M7 7h10v10H7z" />
                    <path d="M5 5h10v10" />
                  </svg>
                </span>
                {{ t("admin.duplicate") }}
              </button>
              <button
                type="button"
                class="btn-ghost folder-action"
                :disabled="csvFolders.length <= 1"
                @click="openFolderDialog('rename', csvFolder)"
              >
                <span class="folder-action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </span>
                {{ t("admin.rename") }}
              </button>
              <button
                type="button"
                class="btn-ghost folder-action"
                :disabled="csvFolders.length <= 1"
                @click="requestDeleteFolder(csvFolder)"
              >
                <span class="folder-action-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                  </svg>
                </span>
                {{ t("admin.delete") }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3">
        <span class="text-[10px] uppercase tracking-[0.3em] text-slate-500">
          Product types
        </span>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="option in categoryOptions"
            :key="option"
            type="button"
            :class="['filter-pill text-[11px]', categoryFilter === option && 'filter-pill-active']"
            @click="categoryFilter = option"
          >
            {{ option === "All" ? "All Types" : option }}
            <span class="ml-2 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
              {{ categoryCounts[option] ?? 0 }}
            </span>
          </button>
        </div>
      </div>

      <div class="toolbar-surface mt-3">
        <div class="toolbar-search">
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
            :placeholder="t('admin.search_placeholder')"
            class="input-compact pl-9"
          />
        </div>
        <div class="toolbar-filters">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            type="button"
            :class="['filter-pill text-[11px]', statusFilter === option.value && 'filter-pill-active']"
            @click="statusFilter = option.value"
          >
            {{ option.label }}
          </button>
          <button
            type="button"
            :class="['filter-pill text-[11px]', showFeatured && 'filter-pill-active']"
            @click="showFeatured = !showFeatured"
          >
            Featured
          </button>
          <select v-model="sortBy" class="input-compact w-36">
            <option value="updated_desc">Newest</option>
            <option value="updated_asc">Oldest</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
          </select>
          <button
            v-if="hasFilters"
            type="button"
            class="filter-pill text-[11px]"
            @click="clearFilters"
          >
            {{ t("admin.clear") }}
          </button>
        </div>
      </div>

      <div v-if="importError" class="alert alert-error mt-3">
        {{ importError }}
      </div>
      <div v-if="importSummary" class="alert alert-success mt-3">
        {{ importSummary }}
      </div>
      <div v-if="importDetails.length" class="panel compact-panel mt-3">
        <p class="text-[10px] uppercase tracking-[0.3em] text-rose-300/80">{{ t("admin.import_issues") }}</p>
        <ul class="mt-2 space-y-1 text-xs text-rose-100">
          <li v-for="detail in importDetails" :key="detail">
            {{ detail }}
          </li>
        </ul>
      </div>

      <div v-if="previewOpen" class="panel compact-panel mt-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="compact-subtitle uppercase tracking-[0.3em]">{{ t("admin.import_preview") }}</p>
            <h2 class="text-sm font-semibold text-slate-100">
              {{ previewFileName || "CSV file" }}
            </h2>
            <p class="compact-subtitle">
              {{ previewRowCount }} row(s) detected. Showing first {{ previewRows.length }}.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-ghost text-xs px-3 py-1.5"
              :disabled="importing"
              @click="cancelPreview"
            >
              {{ t("admin.cancel") }}
            </button>
            <button
              type="button"
              class="btn-primary text-xs px-3 py-1.5"
              :disabled="importing || !previewRows.length"
              @click="confirmImport"
            >
              {{ importing ? t("admin.importing") : t("admin.import") }}
            </button>
          </div>
        </div>

        <div class="mt-3 overflow-x-auto">
          <table class="min-w-full text-xs">
            <thead>
              <tr class="text-left text-slate-400">
                <th
                  v-for="header in previewHeaders"
                  :key="header"
                  class="px-2 py-1 font-semibold whitespace-nowrap"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in previewRows"
                :key="rowIndex"
                class="border-t border-slate-700/60 text-slate-200"
              >
                <td
                  v-for="header in previewHeaders"
                  :key="`${rowIndex}-${header}`"
                  class="px-2 py-1 whitespace-nowrap"
                >
                  {{ row[header] ?? "" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="textCsvOpen" class="panel compact-panel mt-3 text-csv-panel">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="compact-subtitle uppercase tracking-[0.3em]">{{ t("admin.text_csv_title") }}</p>
            <h2 class="text-sm font-semibold text-slate-100">{{ t("admin.text_csv_subtitle") }}</h2>
            <p class="compact-subtitle">{{ t("admin.text_csv_hint") }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="btn-ghost text-xs px-3 py-1.5" @click="resetTextCsv">
              {{ t("admin.clear_text") }}
            </button>
            <button type="button" class="btn-primary text-xs px-3 py-1.5" @click="convertTextCsv">
              {{ t("admin.convert") }}
            </button>
          </div>
        </div>
        <div class="mt-3 grid gap-3 lg:grid-cols-[1.6fr,1fr]">
          <div>
            <label class="text-xs font-semibold text-slate-400 uppercase tracking-[0.25em]">{{ t("admin.paste_text") }}</label>
            <textarea
              v-model="textCsvInput"
              rows="6"
              class="mt-2 w-full rounded-lg border border-slate-700/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Title,SKU,Price\nMini Excavator,MX-18,12900\nSkid Steer,SS-90,9800"
            ></textarea>
          </div>
          <div class="grid gap-3">
            <div>
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-[0.25em]">{{ t("admin.file_name") }}</label>
              <input
                v-model="textCsvFileName"
                type="text"
                class="mt-2 w-full rounded-lg border border-slate-700/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="text-export"
              />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-[0.25em]">{{ t("admin.delimiter") }}</label>
              <select
                v-model="textCsvDelimiter"
                class="mt-2 w-full rounded-lg border border-slate-700/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <option value="auto">Auto detect</option>
                <option value=",">Comma</option>
                <option value="tab">Tab</option>
                <option value="|">Pipe</option>
                <option value=";">Semicolon</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-[0.25em]">{{ t("admin.save_to_folder") }}</label>
              <select
                v-model="textCsvFolder"
                class="mt-2 w-full rounded-lg border border-slate-700/60 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <option v-for="folder in csvFolders" :key="folder" :value="folder">
                  {{ folder }}
                </option>
              </select>
            </div>
            <label class="flex items-center gap-2 text-xs text-slate-300">
              <input v-model="textCsvHasHeader" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
              {{ t("admin.header_row") }}
            </label>
            <label class="flex items-center gap-2 text-xs text-slate-300">
              <input v-model="textCsvDownload" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
              {{ t("admin.download_file") }}
            </label>
            <label class="flex items-center gap-2 text-xs text-slate-300">
              <input v-model="textCsvSaveStorage" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
              {{ t("admin.save_file") }}
            </label>
            <p v-if="textCsvStats" class="text-xs text-slate-400">
              {{ textCsvStats }}
            </p>
            <p v-if="textCsvError" class="text-xs text-rose-300">{{ textCsvError }}</p>
            <p v-if="textCsvSummary" class="text-xs text-emerald-300">{{ textCsvSummary }}</p>
          </div>
        </div>
      </div>

      <div
        v-if="selectionMode"
        class="toolbar-surface toolbar-surface-tight mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"
      >
        <label class="flex items-center gap-2 text-slate-400">
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300"
            :checked="allVisibleSelected"
            :disabled="!displayItems.length"
            @change="toggleAllVisible"
          />
          {{ t("admin.select_visible") }}
        </label>
        <div class="flex flex-wrap items-center gap-2">
          <span v-if="selectedCount" class="chip chip-active">Selected {{ selectedCount }}</span>
          <button
            type="button"
            class="btn-ghost text-xs px-3 py-1.5"
            :disabled="!selectedCount || exporting"
            @click="handleExport(true)"
          >
            {{ t("admin.export_selected") }}
          </button>
          <button
            type="button"
            class="btn-ghost text-xs px-3 py-1.5 text-rose-200"
            :disabled="!selectedCount"
            @click="requestBulkDelete"
          >
            {{ t("admin.delete_selected") }}
          </button>
          <button
            v-if="selectedCount"
            type="button"
            class="filter-pill text-[11px]"
            @click="clearSelection"
          >
            {{ t("admin.clear_selection") }}
          </button>
        </div>
      </div>
      <div v-if="folderDialogOpen" class="folder-dialog-backdrop" @click.self="closeFolderDialog">
        <div class="folder-dialog-card">
          <div class="folder-dialog-head">
            <div class="folder-dialog-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7z" />
              </svg>
            </div>
            <div>
              <p class="folder-dialog-kicker">Workspace folder</p>
              <h3 class="folder-dialog-title">{{ folderDialogTitle }}</h3>
            </div>
          </div>
          <p class="folder-dialog-subtitle">{{ folderDialogSubtitle }}</p>
          <div class="folder-dialog-field">
            <input
              ref="folderDialogInput"
              v-model="folderDialogValue"
              type="text"
              class="folder-dialog-input"
              placeholder="Folder name"
              @keydown.enter.prevent="confirmFolderDialog"
            />
          </div>
          <p v-if="folderDialogError" class="text-xs text-rose-300">{{ folderDialogError }}</p>
          <div class="folder-dialog-actions">
            <button type="button" class="folder-dialog-btn ghost" @click="closeFolderDialog">
              Cancel
            </button>
            <button type="button" class="folder-dialog-btn primary" @click="confirmFolderDialog">
              {{ folderDialogConfirmLabel }}
            </button>
          </div>
        </div>
      </div>
      <div
        v-if="confirmDialogOpen"
        class="folder-dialog-backdrop"
        @click.self="closeConfirmDialog"
      >
        <div class="confirm-dialog-card">
          <div class="confirm-dialog-head">
            <div class="confirm-dialog-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
            </div>
            <div>
              <p class="confirm-dialog-kicker">Confirm action</p>
              <h3 class="confirm-dialog-title">{{ confirmDialogTitle }}</h3>
            </div>
          </div>
          <p class="confirm-dialog-subtitle">{{ confirmDialogMessage }}</p>
          <div class="confirm-dialog-actions">
            <button
              type="button"
              class="confirm-dialog-btn ghost"
              :disabled="confirmDialogProcessing"
              @click="closeConfirmDialog"
            >
              Cancel
            </button>
            <button
              type="button"
              class="confirm-dialog-btn danger"
              :disabled="confirmDialogProcessing"
              @click="confirmDialogRun"
            >
              {{ confirmDialogConfirmLabel }}
            </button>
          </div>
        </div>
      </div>
        </div>

        <div class="compact-scroll">
          <div v-if="loading" class="grid gap-2 md:grid-cols-2">
            <div v-for="n in 6" :key="n" class="skeleton h-20"></div>
          </div>

          <div v-else-if="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <div v-else class="space-y-3 ruler-grid">
            <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>{{ t("admin.showing") }} {{ displayItems.length }} {{ t("admin.of") }} {{ itemsCount }} {{ t("admin.items") }}</span>
              <span v-if="hasFilters" class="chip chip-active">{{ t("admin.filters_active") }}</span>
            </div>

            <div
              v-if="displayItems.length"
              class="grid gap-2 md:grid-cols-2 stagger default_cursor_land"
            >
              <div
                v-for="item in displayItems"
                :key="item.id"
                class="compact-card flex items-center justify-between gap-3"
              >
                <div class="flex items-center gap-3">
                  <label v-if="selectionMode" class="self-center">
                    <input
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300"
                      :checked="isSelected(item.id)"
                      @change="toggleSelected(item.id)"
                    />
                  </label>
                  <div class="product-avatar">
                    <img
                      v-if="getItemImage(item)"
                      :src="getItemImage(item)"
                      :alt="item.title"
                      loading="lazy"
                    />
                    <div v-else class="product-avatar-placeholder">
                      {{ getInitials(item.title) }}
                    </div>
                  </div>
                  <div class="min-w-0 space-y-1">
                    <div class="flex items-center gap-2 min-w-0">
                      <h2
                        class="item-title text-sm font-semibold text-slate-100 truncate max-w-[220px] sm:max-w-[320px] md:max-w-[420px] lg:max-w-[520px]"
                        :title="item.title"
                      >
                        {{ truncateTitle(item.title) }}
                      </h2>
                      <StatusBadge :status="item.status" />
                      <span v-if="item.sku" class="chip text-[10px]">SKU {{ item.sku }}</span>
                    </div>
                    <div class="compact-meta flex flex-wrap gap-x-3 gap-y-2">
                      <span v-if="item.sku" class="meta-pill">SKU {{ item.sku }}</span>
                      <span v-if="item.stock_status" class="meta-pill">
                        Stock {{ item.stock_status }}
                      </span>
                      <span
                        v-if="priceById[item.id]?.sale"
                        class="meta-pill meta-pill-sale font-semibold"
                      >
                        Sale {{ priceById[item.id].sale }}
                      </span>
                      <span
                        v-if="priceById[item.id]?.regular"
                        class="meta-pill"
                        :class="priceById[item.id].strike ? 'meta-pill-strike' : 'text-slate-200'"
                      >
                        {{
                          priceById[item.id].strike
                            ? `Reg ${priceById[item.id].regular}`
                            : `Price ${priceById[item.id].regular}`
                        }}
                      </span>
                    </div>
                    <p class="compact-meta">Updated {{ new Date(item.updated_at).toLocaleDateString() }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <NuxtLink
                    :to="`/admin/edit/${item.id}`"
                    class="btn-ghost text-xs px-3 py-1.5"
                  >
                    {{ t("admin.edit") }}
                  </NuxtLink>
                  <button
                    class="btn-ghost text-xs px-3 py-1.5 text-rose-200"
                    type="button"
                    @click="requestDeleteItem(item.id, item.title)"
                  >
                    {{ t("admin.delete_item") }}
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="card border-dashed border-slate-700/60 p-4 text-xs text-slate-400">
              No items match your filters. Try clearing filters or updating your search.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Attachment, ItemStatus, WorkspaceItem } from "~/types/db";
import { toCsv, downloadCsv, parseCsv } from "~/utils/csv";
import { parseImagesField } from "~/utils/parseImagesField";
import { formatImagesForWoo } from "~/services/csvExportService";

const EXPORT_COLUMNS = [
  "post_title",
  "post_name",
  "post_parent",
  "ID",
  "post_content",
  "post_excerpt",
  "post_status",
  "post_password",
  "menu_order",
  "post_date",
  "post_author",
  "comment_status",
  "sku",
  "parent_sku",
  "children",
  "downloadable",
  "virtual",
  "stock",
  "regular_price",
  "sale_price",
  "weight",
  "length",
  "width",
  "height",
  "tax_class",
  "stock_status",
  "backorders",
  "sold_individually",
  "low_stock_amount",
  "manage_stock",
  "tax_status",
  "upsell_ids",
  "crosssell_ids",
  "featured",
  "purchase_note",
  "sale_price_dates_from",
  "sale_price_dates_to",
  "download_limit",
  "download_expiry",
  "product_url",
  "button_text",
  "images",
  "downloadable_files",
  "product_page_url",
  "tax:product_brand",
  "tax:product_type",
  "tax:product_visibility",
  "tax:product_cat",
  "tax:product_tag",
  "tax:product_shipping_class",
  "meta:eg_custom_meta_216",
  "meta:eg_html5_ratio",
  "meta:eg_soundcloud_ratio",
  "meta:eg_vimeo_ratio",
  "meta:eg_votes_count",
  "meta:eg_wistia_ratio",
  "meta:eg_youtube_ratio",
  "meta:ekit_post_views_count",
  "meta:newts_product_brand",
  "meta:newts_product_brand_parent",
  "meta:nova_total_stock_quantity",
  "meta:rank_math_analytic_object_id",
  "meta:rank_math_contentai_score",
  "meta:rank_math_description",
  "meta:rank_math_focus_keyword",
  "meta:rank_math_facebook_title",
  "meta:rank_math_facebook_description",
  "meta:rank_math_facebook_image",
  "meta:rank_math_twitter_title",
  "meta:rank_math_twitter_description",
  "meta:rank_math_twitter_image",
  "meta:rank_math_canonical_url",
  "meta:rank_math_internal_links_processed",
  "meta:rank_math_primary_product_brand",
  "meta:rank_math_primary_product_cat",
  "meta:rank_math_primary_ts_product_brand",
  "meta:rank_math_seo_score",
  "meta:rank_math_title",
  "meta:rs_page_bg_color",
  "meta:shopengine_product_views_count",
  "meta:total_sales",
  "meta:_global_unique_id",
  "meta:ts_prod_custom_tab",
  "meta:ts_prod_layout",
  "meta:ts_prod_left_sidebar",
  "meta:ts_prod_right_sidebar",
  "meta:two_optimized_date",
  "meta:wpil_links_inbound_internal_count",
  "meta:wpil_links_inbound_internal_count_data",
  "meta:wpil_links_outbound_external_count",
  "meta:wpil_links_outbound_external_count_data",
  "meta:wpil_links_outbound_internal_count",
  "meta:wpil_links_outbound_internal_count_data",
  "meta:wpil_sync_report2_time",
  "meta:wpil_sync_report3",
  "attribute:pa_brand",
  "attribute_data:pa_brand",
  "attribute_default:pa_brand",
  "attribute:pa_engine",
  "attribute_data:pa_engine",
  "attribute_default:pa_engine",
  "attribute:pa_horsepower",
  "attribute_data:pa_horsepower",
  "attribute_default:pa_horsepower"
];

const IMAGE_SEPARATOR_KEY = "csvImageSeparator";

type AttributeRecord = {
  values: string;
  defaultValue: string;
};

const toYesNo = (value: boolean) => (value ? "yes" : "no");

const normalizeAttributeName = (value: string | null | undefined) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

const buildAttributeMap = (item: WorkspaceItem) => {
  const map = new Map<string, AttributeRecord>();
  const register = (
    name: string | null,
    values: string | null,
    defaultValue: string | null
  ) => {
    const key = normalizeAttributeName(name);
    if (!key) return;
    map.set(key, {
      values: values ?? "",
      defaultValue: defaultValue ?? ""
    });
  };

  register(item.attr_1_name, item.attr_1_values, item.attr_1_default);
  register(item.attr_2_name, item.attr_2_values, item.attr_2_default);
  register(item.attr_3_name, item.attr_3_values, item.attr_3_default);
  return map;
};

const findAttribute = (map: Map<string, AttributeRecord>, keys: string[]) => {
  for (const key of keys) {
    const normalized = normalizeAttributeName(key);
    const match = map.get(normalized);
    if (match) return match;
  }
  return null;
};

const buildDownloadableFiles = (item: WorkspaceItem) => {
  const files: string[] = [];
  const append = (name: string | null, url: string | null) => {
    if (!name && !url) return;
    if (name && url) {
      files.push(`${name}|${url}`);
      return;
    }
    files.push(url ?? name ?? "");
  };

  append(item.download_1_name, item.download_1_url);
  append(item.download_2_name, item.download_2_url);
  return files.filter((value) => value.trim().length > 0).join(", ");
};

const normalizeHeader = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const parseBoolean = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(normalized)) return true;
  if (["0", "false", "no", "n"].includes(normalized)) return false;
  return false;
};

const valueFor = (row: Record<string, string>, keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return "";
};

const toStatusFromWordpress = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (["publish", "published"].includes(normalized)) return "published";
  if (normalized === "private") return "private";
  return "draft";
};

const toCommentStatus = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "closed";
  if (["open", "closed"].includes(normalized)) return normalized;
  return parseBoolean(normalized) ? "open" : "closed";
};

const toStockStatus = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "";
  if (["instock", "outofstock", "onbackorder"].includes(normalized)) return normalized;
  return parseBoolean(normalized) ? "instock" : "outofstock";
};

const toBackorders = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "";
  if (["no", "notify", "yes"].includes(normalized)) return normalized;
  return parseBoolean(normalized) ? "yes" : "no";
};

const countDelimiter = (line: string, delimiter: string) => {
  let count = 0;
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && char === delimiter) {
      count += 1;
    }
  }
  return count;
};

const detectDelimiter = (input: string) => {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);
  if (!lines.length) return ",";
  const candidates = [",", "\t", "|", ";"];
  let best = ",";
  let bestScore = 0;
  for (const candidate of candidates) {
    const score = lines.reduce((total, line) => total + countDelimiter(line, candidate), 0);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return bestScore === 0 ? "," : best;
};

const parseDelimitedRows = (input: string, delimiter: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushRow = () => {
    row.push(cell);
    const hasContent = row.some((value) => value.trim().length > 0);
    if (hasContent) {
      rows.push(row);
    }
    row = [];
    cell = "";
  };

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (char === "\"") {
      if (inQuotes && input[i + 1] === "\"") {
        cell += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && input[i + 1] === "\n") {
        i += 1;
      }
      pushRow();
      continue;
    }

    cell += char;
  }

  if (cell.length || row.length) {
    pushRow();
  }

  return rows;
};

const normalizeTextHeader = (value: string, index: number) => {
  const cleaned = value.replace(/^\uFEFF/, "").trim();
  return cleaned || `Column ${index + 1}`;
};

const truncateTitle = (value: string, maxLength = 32) => {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  const slice = trimmed.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  const clipped = lastSpace > 10 ? slice.slice(0, lastSpace) : slice;
  return `${clipped}…`;
};

const { listItems, deleteItem, createItem } = useItems();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const runtimeConfig = useRuntimeConfig();
const devOwnerId = computed(() => runtimeConfig.public.devOwnerId || "");
const { $md } = useNuxtApp();
const { t } = useLocale();
const csvFolders = ref<string[]>([]);
const csvFolder = ref<string>("production");
const foldersReady = ref(false);
const folderLoading = ref(false);

const updateActiveFolder = async (name: string) => {
  const effectiveId = user.value?.id || devOwnerId.value;
  if (!effectiveId) return;
  try {
    await $fetch("/api/workspace-folders/ensure", {
      method: "POST",
      body: { name, setActive: true, ownerId: effectiveId }
    });
  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || "Failed to update active workspace.";
  }
};

const loadFolders = async () => {
  foldersReady.value = false;
  folderLoading.value = true;
  let rows: Array<{ id?: string; name: string; is_active?: boolean; owner_id?: string }> = [];
  try {
    const effectiveId = user.value?.id || devOwnerId.value;
    const response = await $fetch<{ items?: Array<{ name: string; is_active?: boolean; owner_id?: string }> }>(
      "/api/workspace-folders/list",
      { query: effectiveId ? { ownerId: effectiveId } : {} }
    );
    const raw = response?.items ?? [];
    if (user.value?.id) {
      rows = raw.filter((row) => row.owner_id === user.value?.id);
    } else if (devOwnerId.value) {
      rows = raw.filter((row) => row.owner_id === devOwnerId.value);
    } else {
      rows = raw;
    }
  } catch {
    // ignore and fall back to direct client query
  }

  if (!rows.length && (user.value?.id || devOwnerId.value)) {
    const ownerId = user.value?.id || devOwnerId.value;
    const { data, error } = await supabase
      .from("workspace_folders")
      .select("id,name,is_active")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: true });

    if (error) {
      errorMessage.value = error.message || "Failed to load workspaces.";
      folderLoading.value = false;
      foldersReady.value = true;
      return;
    }

    rows = data ?? [];
  }

  if (!rows.length && (user.value?.id || devOwnerId.value)) {
    const ownerId = user.value?.id || devOwnerId.value;
    const { data: created, error: createError } = await supabase
      .from("workspace_folders")
      .insert({ owner_id: ownerId, name: "production", is_active: true })
      .select("id,name,is_active");
    if (createError) {
      errorMessage.value = createError.message || "Failed to create default workspace.";
    }
    rows = created ?? [];
  }

  if (!rows.length) {
    csvFolders.value = [];
    csvFolder.value = "production";
    textCsvFolder.value = "production";
    folderLoading.value = false;
    foldersReady.value = true;
    return;
  }

  const active = rows.find((row) => row.is_active)?.name ?? rows[0]?.name ?? "production";
  csvFolders.value = rows.map((row) => row.name);
  csvFolder.value = active;
  if (!csvFolders.value.includes(textCsvFolder.value)) {
    textCsvFolder.value = csvFolder.value;
  }
  if (!rows.some((row) => row.is_active) && active && (user.value?.id || devOwnerId.value)) {
    await updateActiveFolder(active);
  }
  folderLoading.value = false;
  foldersReady.value = true;
};

const syncFoldersFromItems = async () => {
  if (!foldersReady.value || !user.value) return;
  const names = new Set(csvFolders.value);
  const seen = new Set(items.value.map((item) => normalizeFolderValue(item.folder)));
  const missing = [...seen].filter((name) => !names.has(name));
  if (!missing.length) return;
  const ownerId = user.value.id;
  const payload = missing.map((name) => ({ owner_id: ownerId, name, is_active: false }));
  const { error } = await supabase.from("workspace_folders").insert(payload);
  if (error && (error as any).code !== "23505") {
    errorMessage.value = error.message || "Failed to sync workspaces.";
    return;
  }
  csvFolders.value = [...csvFolders.value, ...missing];
};

const addFolder = async (name: string) => {
  const clean = name.trim();
  if (!clean) return;
  if (csvFolders.value.includes(clean)) {
    csvFolder.value = clean;
    return;
  }
  const effectiveId = user.value?.id || devOwnerId.value;
  if (!effectiveId) return;
  try {
    await $fetch("/api/workspace-folders/ensure", {
      method: "POST",
      body: { name: clean, setActive: true, ownerId: effectiveId }
    });
    await loadFolders();
    csvFolder.value = clean;
    textCsvFolder.value = clean;
  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || "Failed to create workspace.";
  }
};

const duplicateFolder = async (source: string, name: string) => {
  const baseName = `${source}-copy`;
  const clean = name.trim() || baseName;
  if (!clean) return;
  if (csvFolders.value.includes(clean)) {
    csvFolder.value = clean;
    return;
  }
  const effectiveId = user.value?.id || devOwnerId.value;
  if (!effectiveId) return;
  try {
    await $fetch("/api/workspace-folders/ensure", {
      method: "POST",
      body: { name: clean, setActive: false, ownerId: effectiveId }
    });
  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || "Failed to create workspace.";
    return;
  }
  csvFolders.value = [...csvFolders.value, clean];
  csvFolder.value = clean;
  textCsvFolder.value = clean;

  let sourceItems: WorkspaceItem[] = [];
  if (user.value) {
    let sourceRequest = supabase.from("workspace_items").select("*");
    if (source === "production") {
      sourceRequest = sourceRequest.or("folder.is.null,folder.eq.production");
    } else {
      sourceRequest = sourceRequest.eq("folder", source);
    }

    const { data, error } = await sourceRequest;
    if (error) {
      errorMessage.value = error.message || "Failed to load folder items.";
      return;
    }
    sourceItems = (data ?? []) as WorkspaceItem[];
  } else {
    const all = await listItems();
    sourceItems =
      source === "production"
        ? all.filter((item) => {
            const folder = (item.folder ?? "").trim();
            return !folder || folder === "production";
          })
        : all.filter((item) => (item.folder ?? "").trim() === source);
  }
  if (!sourceItems.length) return;

  let created = 0;
  let failed = 0;
  for (const item of sourceItems) {
    try {
      await createItem({
        title: item.title,
        excerpt: item.excerpt ?? "",
        content_md: item.content_md ?? "",
        status: item.status as ItemStatus,
        featured: item.featured ?? false,
        folder: clean,
        parent_id: item.parent_id ?? undefined,
        post_id: item.post_id ?? undefined,
        post_password: item.post_password ?? undefined,
        menu_order: item.menu_order ?? undefined,
        post_date: item.post_date ?? undefined,
        post_author: item.post_author ?? undefined,
        comment_status: item.comment_status ?? undefined,
        sku: item.sku ?? undefined,
        parent_sku: item.parent_sku ?? undefined,
        children: item.children ?? undefined,
        downloadable: item.downloadable ?? undefined,
        virtual: item.virtual ?? undefined,
        stock: item.stock ?? undefined,
        regular_price: item.regular_price ?? undefined,
        sale_price: item.sale_price ?? undefined,
        weight: item.weight ?? undefined,
        length: item.length ?? undefined,
        width: item.width ?? undefined,
        height: item.height ?? undefined,
        tax_class: item.tax_class ?? undefined,
        stock_status: item.stock_status ?? undefined,
        backorders: item.backorders ?? undefined,
        sold_individually: item.sold_individually ?? undefined,
        low_stock_amount: item.low_stock_amount ?? undefined,
        manage_stock: item.manage_stock ?? undefined,
        tax_status: item.tax_status ?? undefined,
        upsell_ids: item.upsell_ids ?? undefined,
        crosssell_ids: item.crosssell_ids ?? undefined,
        purchase_note: item.purchase_note ?? undefined,
        sale_price_dates_from: item.sale_price_dates_from ?? undefined,
        sale_price_dates_to: item.sale_price_dates_to ?? undefined,
        download_limit: item.download_limit ?? undefined,
        download_expiry: item.download_expiry ?? undefined,
        product_url: item.product_url ?? undefined,
        button_text: item.button_text ?? undefined,
        product_type: item.product_type ?? undefined,
        categories: item.categories ?? undefined,
        tags: item.tags ?? undefined,
        images: item.images ?? undefined,
        short_description: item.short_description ?? undefined,
        shipping_class: item.shipping_class ?? undefined,
        visibility: item.visibility ?? undefined,
        attr_1_name: item.attr_1_name ?? undefined,
        attr_1_values: item.attr_1_values ?? undefined,
        attr_1_visible: item.attr_1_visible ?? undefined,
        attr_1_global: item.attr_1_global ?? undefined,
        attr_1_default: item.attr_1_default ?? undefined,
        attr_2_name: item.attr_2_name ?? undefined,
        attr_2_values: item.attr_2_values ?? undefined,
        attr_2_visible: item.attr_2_visible ?? undefined,
        attr_2_global: item.attr_2_global ?? undefined,
        attr_2_default: item.attr_2_default ?? undefined,
        attr_3_name: item.attr_3_name ?? undefined,
        attr_3_values: item.attr_3_values ?? undefined,
        attr_3_visible: item.attr_3_visible ?? undefined,
        attr_3_global: item.attr_3_global ?? undefined,
        attr_3_default: item.attr_3_default ?? undefined,
        download_1_name: item.download_1_name ?? undefined,
        download_1_url: item.download_1_url ?? undefined,
        download_2_name: item.download_2_name ?? undefined,
        download_2_url: item.download_2_url ?? undefined,
        rank_math_title: item.rank_math_title ?? undefined,
        rank_math_description: item.rank_math_description ?? undefined,
        rank_math_facebook_title: item.rank_math_facebook_title ?? undefined,
        rank_math_facebook_description: item.rank_math_facebook_description ?? undefined,
        rank_math_facebook_image: item.rank_math_facebook_image ?? undefined,
        rank_math_twitter_title: item.rank_math_twitter_title ?? undefined,
        rank_math_twitter_description: item.rank_math_twitter_description ?? undefined,
        rank_math_twitter_image: item.rank_math_twitter_image ?? undefined,
        rank_math_focus_keyword: item.rank_math_focus_keyword ?? undefined,
        rank_math_canonical_url: item.rank_math_canonical_url ?? undefined
      });
      created += 1;
    } catch (error) {
      failed += 1;
    }
  }

  if (failed) {
    errorMessage.value = `Duplicated ${created} items, ${failed} failed.`;
  }
  await loadItems();
};

const deleteFolder = (name: string) => {
  if (csvFolders.value.length <= 1) return;
  const fallback = csvFolders.value.find((f) => f !== name) ?? "production";
  const effectiveId = user.value?.id || devOwnerId.value;
  if (!effectiveId) return;
  $fetch("/api/workspace-folders/delete", {
    method: "POST",
    body: { name, fallback, ownerId: effectiveId }
  })
    .then(() => {
      csvFolders.value = csvFolders.value.filter((f) => f !== name);
      if (!csvFolders.value.includes(csvFolder.value)) {
        csvFolder.value = fallback;
      }
      loadItems();
    })
    .catch((error: any) => {
      errorMessage.value = error?.message || "Failed to delete workspace.";
    });
};

const requestDeleteFolder = (name: string) => {
  if (csvFolders.value.length <= 1) return;
  const fallback = csvFolders.value.find((f) => f !== name) ?? "production";
  openConfirmDialog({
    title: t("admin.delete_folder_title"),
    message: t("admin.delete_folder_message", { name, fallback }),
    confirmLabel: t("admin.delete_confirm"),
    action: () => deleteFolder(name)
  });
};

const renameFolder = (name: string, next: string) => {
  const clean = next.trim();
  if (!clean || clean === name) return;
  if (csvFolders.value.includes(clean)) {
    csvFolder.value = clean;
    return;
  }
  const effectiveId = user.value?.id || devOwnerId.value;
  if (!effectiveId) return;
  $fetch("/api/workspace-folders/rename", {
    method: "POST",
    body: { name, next: clean, ownerId: effectiveId }
  })
    .then(() => {
      csvFolders.value = csvFolders.value.map((f) => (f === name ? clean : f));
      csvFolder.value = clean;
      textCsvFolder.value = clean;
      loadItems();
    })
    .catch((error: any) => {
      errorMessage.value = error?.message || "Failed to rename workspace.";
    });
};

const items = ref<WorkspaceItem[]>([]);
const attachmentsByItemId = ref<Record<string, Attachment[]>>({});
const attachmentImageById = ref<Record<string, string>>({});
const query = ref("");
const selectedIds = ref<string[]>([]);
const selectionMode = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const exporting = ref(false);
const importing = ref(false);
const importError = ref("");
const importSummary = ref("");
const importInput = ref<HTMLInputElement | null>(null);
const previewOpen = ref(false);
const previewHeaders = ref<string[]>([]);
const previewRows = ref<Record<string, string>[]>([]);
const previewRowCount = ref(0);
const previewFileName = ref("");
const previewData = ref<{ headers: string[]; rows: string[][] } | null>(null);
const importDetails = ref<string[]>([]);
const imageSeparator = ref<"auto" | "pipe" | "comma">("comma");
const imageSeparatorWarning = computed(() => {
  if (imageSeparator.value !== "pipe") return "";
  const candidates = selectedOnly.value
    ? items.value.filter((item) => selectedIds.value.includes(item.id))
    : items.value;
  const hasCommaOnly = candidates.some((item) => {
    const raw = item.images ?? "";
    return raw.includes(",") && !raw.includes("|");
  });
  if (!hasCommaOnly) return "";
  return "Some products use comma-separated images. Using pipe may fail import. Switch to Comma or Auto.";
});
const folderDialogOpen = ref(false);
const folderDialogMode = ref<"add" | "rename" | "duplicate">("add");
const folderDialogValue = ref("");
const folderDialogSource = ref("");
const folderDialogError = ref("");
const folderDialogInput = ref<HTMLInputElement | null>(null);
const confirmDialogOpen = ref(false);
const confirmDialogTitle = ref("");
const confirmDialogMessage = ref("");
const confirmDialogConfirmLabel = ref("Confirm");
const confirmDialogProcessing = ref(false);
const confirmDialogAction = ref<null | (() => Promise<void> | void)>(null);
const textCsvOpen = ref(false);
const textCsvInput = ref("");
const textCsvDelimiter = ref<"auto" | "," | "|" | ";" | "tab">("auto");
const textCsvHasHeader = ref(true);
const textCsvFileName = ref("");
const textCsvFolder = ref<string>("production");
const textCsvDownload = ref(true);
const textCsvSaveStorage = ref(true);
const textCsvError = ref("");
const textCsvSummary = ref("");
const PRODUCT_TYPE_KEY = "csvProductTypeActive";
const textCsvStats = computed(() => {
  if (!textCsvInput.value.trim()) return "";
  const raw = textCsvInput.value.trim();
  const delimiter =
    textCsvDelimiter.value === "auto"
      ? detectDelimiter(raw)
      : textCsvDelimiter.value === "tab"
        ? "\t"
        : textCsvDelimiter.value;
  const rows = parseDelimitedRows(raw, delimiter);
  if (!rows.length) return "";
  const columnCount = Math.max(...rows.map((row) => row.length));
  const dataRows = textCsvHasHeader.value ? rows.slice(1) : rows;
  if (!dataRows.length) return "";
  return `${dataRows.length} row(s) · ${columnCount} column(s)`;
});
const normalizeFolderValue = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "production";
};
const folderDialogTitle = computed(() => {
  if (folderDialogMode.value === "rename") return t("admin.folder_rename_title");
  if (folderDialogMode.value === "duplicate") return t("admin.folder_duplicate_title");
  return t("admin.folder_create_title");
});
const folderDialogSubtitle = computed(() => {
  if (folderDialogMode.value === "rename") {
    return t("admin.folder_rename_sub", { name: folderDialogSource.value });
  }
  if (folderDialogMode.value === "duplicate") {
    return t("admin.folder_duplicate_sub", { name: folderDialogSource.value });
  }
  return t("admin.folder_create_sub");
});
const folderDialogConfirmLabel = computed(() => {
  if (folderDialogMode.value === "rename") return t("admin.rename");
  if (folderDialogMode.value === "duplicate") return t("admin.duplicate");
  return t("admin.folder_create_btn");
});

const openFolderDialog = (mode: "add" | "rename" | "duplicate", source?: string) => {
  folderDialogMode.value = mode;
  folderDialogSource.value = source ?? csvFolder.value;
  folderDialogError.value = "";
  if (mode === "rename") {
    folderDialogValue.value = folderDialogSource.value;
  } else if (mode === "duplicate") {
    folderDialogValue.value = `${folderDialogSource.value}-copy`;
  } else {
    folderDialogValue.value = "";
  }
  folderDialogOpen.value = true;
  nextTick(() => folderDialogInput.value?.focus());
};

const closeFolderDialog = () => {
  folderDialogOpen.value = false;
  folderDialogError.value = "";
};

const confirmFolderDialog = async () => {
  const clean = folderDialogValue.value.trim();
  if (!clean) {
    folderDialogError.value = t("admin.folder_name_required");
    return;
  }
  if (folderDialogMode.value !== "rename" && csvFolders.value.includes(clean)) {
    folderDialogError.value = t("admin.folder_exists");
    return;
  }
  if (folderDialogMode.value === "rename") {
    if (clean === folderDialogSource.value) {
      closeFolderDialog();
      return;
    }
    if (csvFolders.value.includes(clean)) {
      folderDialogError.value = t("admin.folder_exists");
      return;
    }
    renameFolder(folderDialogSource.value, clean);
    closeFolderDialog();
    return;
  }
  if (folderDialogMode.value === "duplicate") {
    closeFolderDialog();
    await duplicateFolder(folderDialogSource.value, clean);
    return;
  }
  addFolder(clean);
  closeFolderDialog();
};

const openConfirmDialog = (options: {
  title: string;
  message: string;
  confirmLabel?: string;
  action: () => Promise<void> | void;
}) => {
  confirmDialogTitle.value = options.title;
  confirmDialogMessage.value = options.message;
  confirmDialogConfirmLabel.value = options.confirmLabel ?? "Confirm";
  confirmDialogAction.value = options.action;
  confirmDialogProcessing.value = false;
  confirmDialogOpen.value = true;
};

const closeConfirmDialog = () => {
  confirmDialogOpen.value = false;
  confirmDialogProcessing.value = false;
  confirmDialogAction.value = null;
};

const confirmDialogRun = async () => {
  if (!confirmDialogAction.value) {
    closeConfirmDialog();
    return;
  }
  confirmDialogProcessing.value = true;
  try {
    await confirmDialogAction.value();
  } finally {
    closeConfirmDialog();
  }
};
const folderItems = computed(() =>
  items.value.filter((item) => normalizeFolderValue(item.folder) === csvFolder.value)
);
const folderCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {};
  csvFolders.value.forEach((folder) => {
    counts[folder] = 0;
  });
  items.value.forEach((item) => {
    const key = normalizeFolderValue(item.folder);
    counts[key] = (counts[key] ?? 0) + 1;
  });
  return counts;
});
const itemsCount = computed(() => folderItems.value.length);
const publishedCount = computed(
  () => folderItems.value.filter((item) => item.status === "published").length
);
const draftCount = computed(() => folderItems.value.filter((item) => item.status === "draft").length);
const privateCount = computed(() => folderItems.value.filter((item) => item.status === "private").length);
const featuredCount = computed(() => folderItems.value.filter((item) => item.featured).length);
const latestUpdatedLabel = computed(() => {
  if (!folderItems.value.length) return "No items yet";
  const latest = folderItems.value.reduce((acc, item) => {
    const updated = new Date(item.updated_at).getTime();
    return updated > acc ? updated : acc;
  }, 0);
  if (!latest) return "No activity";
  return new Date(latest).toLocaleString();
});
const publishedPercent = computed(() => {
  if (!itemsCount.value) return 0;
  return Math.round((publishedCount.value / itemsCount.value) * 100);
});
const statusFilter = ref<"all" | ItemStatus>("all");
const showFeatured = ref(false);
const categoryFilter = ref("All");
const sortBy = ref<"updated_desc" | "updated_asc" | "title_asc" | "title_desc">("updated_desc");
const statusOptions = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "private", label: "Private" }
] as const;
const categoryOptions = [
  "All",
  "Mini Excavator",
  "Skid Steer",
  "Forklift",
  "Road Roller"
];
const categoryCounts = computed<Record<string, number>>(() => {
  const counts: Record<string, number> = {};
  categoryOptions.forEach((option) => {
    counts[option] = 0;
  });
  const activeFolder = csvFolder.value;
  for (const item of items.value) {
    if (normalizeFolderValue(item.folder) !== activeFolder) continue;
    counts["All"] += 1;
    const categories = (item.categories ?? "").toLowerCase();
    categoryOptions.forEach((option) => {
      if (option === "All") return;
      if (categories.includes(option.toLowerCase())) {
        counts[option] += 1;
      }
    });
  }
  return counts;
});
const filteredItems = computed(() => {
  let list = items.value.slice();
  const activeFolder = csvFolder.value;
  list = list.filter((item) => normalizeFolderValue(item.folder) === activeFolder);
  if (statusFilter.value !== "all") {
    list = list.filter((item) => item.status === statusFilter.value);
  }
  if (showFeatured.value) {
    list = list.filter((item) => item.featured);
  }
  if (categoryFilter.value !== "All") {
    const needle = categoryFilter.value.toLowerCase();
    list = list.filter((item) => (item.categories ?? "").toLowerCase().includes(needle));
  }
  return list;
});
const sortItems = (list: WorkspaceItem[]) => {
  const sorted = list.slice();
  switch (sortBy.value) {
    case "updated_asc":
      return sorted.sort(
        (a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      );
    case "title_asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title_desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return sorted.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
  }
};
const displayItems = computed(() => sortItems(filteredItems.value));
const hasFilters = computed(
  () =>
    statusFilter.value !== "all" ||
    showFeatured.value ||
    sortBy.value !== "updated_desc" ||
    categoryFilter.value !== "All"
);
const selectedCount = computed(() => selectedIds.value.length);
const visibleIds = computed(() => displayItems.value.map((item) => item.id));
const allVisibleSelected = computed(() => {
  if (!visibleIds.value.length) return false;
  return visibleIds.value.every((id) => selectedIds.value.includes(id));
});

const applyFilters = (list: WorkspaceItem[]) => {
  let filtered = list.slice();
  const activeFolder = csvFolder.value;
  filtered = filtered.filter((item) => normalizeFolderValue(item.folder) === activeFolder);
  if (statusFilter.value !== "all") {
    filtered = filtered.filter((item) => item.status === statusFilter.value);
  }
  if (showFeatured.value) {
    filtered = filtered.filter((item) => item.featured);
  }
  if (categoryFilter.value !== "All") {
    const needle = categoryFilter.value.toLowerCase();
    filtered = filtered.filter((item) => (item.categories ?? "").toLowerCase().includes(needle));
  }
  return filtered;
};

const clearFilters = () => {
  statusFilter.value = "all";
  showFeatured.value = false;
  sortBy.value = "updated_desc";
  categoryFilter.value = "All";
};

const isSelected = (id: string) => selectedIds.value.includes(id);

const toggleSelected = (id: string) => {
  if (isSelected(id)) {
    selectedIds.value = selectedIds.value.filter((selected) => selected !== id);
    return;
  }
  selectedIds.value = [...selectedIds.value, id];
};

const toggleAllVisible = () => {
  if (allVisibleSelected.value) {
    selectedIds.value = selectedIds.value.filter((id) => !visibleIds.value.includes(id));
    return;
  }
  const merged = new Set([...selectedIds.value, ...visibleIds.value]);
  selectedIds.value = Array.from(merged);
};

const clearSelection = () => {
  selectedIds.value = [];
};

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value;
  if (!selectionMode.value) {
    selectedIds.value = [];
  }
};

const getInitials = (value: string) => {
  const words = value.trim().split(/\s+/).slice(0, 2);
  return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
};

const isImageUrl = (value: string) => {
  return /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(value.split("?")[0] ?? "");
};

const getItemImageFromField = (item: WorkspaceItem) => {
  const urls = parseImagesField(item.images ?? "");
  return urls[0] || "";
};

const getItemImage = (item: WorkspaceItem) => {
  return getItemImageFromField(item) || attachmentImageById.value[item.id] || "";
};

const formatPrice = (value: string | null | undefined) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
};

const priceById = computed(() => {
  const map: Record<string, { sale: string; regular: string; strike: boolean }> = {};
  for (const item of displayItems.value) {
    const sale = formatPrice(item.sale_price);
    const regular = formatPrice(item.regular_price);
    map[item.id] = {
      sale,
      regular,
      strike: Boolean(sale)
    };
  }
  return map;
});

let latestLoadId = 0;
const loadAttachmentImages = async (
  list: WorkspaceItem[],
  map: Record<string, Attachment[]>,
  loadId?: number
) => {
  const result: Record<string, string> = {};
  const tasks = list.map(async (item) => {
    if (getItemImageFromField(item)) return;
    const attachments = map[item.id] ?? [];
    const candidate = attachments.find((attachment) => isImageUrl(attachment.url));
    if (!candidate) return;
    if (candidate.type === "file") {
      const { data, error } = await supabase.storage
        .from("workspace")
        .createSignedUrl(candidate.url, 60 * 10);
      if (error) return;
      if (data?.signedUrl) {
        result[item.id] = data.signedUrl;
      }
    } else {
      result[item.id] = candidate.url;
    }
  });

  await Promise.all(tasks);
  if (loadId !== undefined && loadId !== latestLoadId) return;
  attachmentImageById.value = result;
};

const loadAttachments = async (list: WorkspaceItem[], loadId?: number) => {
  if (loadId !== undefined && loadId !== latestLoadId) return;
  if (!list.length) {
    attachmentsByItemId.value = {};
    attachmentImageById.value = {};
    return;
  }

  const ids = list.map((item) => item.id);
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .in("item_id", ids);

  if (error) {
    throw error;
  }

  const map: Record<string, Attachment[]> = {};
  for (const attachment of data ?? []) {
    const bucket = map[attachment.item_id] ?? [];
    bucket.push(attachment);
    map[attachment.item_id] = bucket;
  }
  if (loadId !== undefined && loadId !== latestLoadId) return;
  attachmentsByItemId.value = map;
  await loadAttachmentImages(list, map, loadId);
};

const loadItems = async () => {
  const loadId = Date.now() + Math.random();
  latestLoadId = loadId;
  loading.value = true;
  errorMessage.value = "";
  try {
    const nextItems = await listItems(query.value);
    if (loadId !== latestLoadId) return;

    items.value = nextItems;
    attachmentsByItemId.value = {};
    attachmentImageById.value = {};

    const itemIds = new Set(items.value.map((item) => item.id));
    selectedIds.value = selectedIds.value.filter((id) => itemIds.has(id));
    await syncFoldersFromItems();

    // Keep the table responsive: attachments/images can take much longer than item rows.
    loading.value = false;
    void loadAttachments(nextItems, loadId).catch(() => {
      if (loadId !== latestLoadId) return;
    });
  } catch (error) {
    if (loadId !== latestLoadId) return;
    const err = error as Error;
    errorMessage.value = err.message || t("admin.load_failed");
  } finally {
    if (loadId === latestLoadId) {
      loading.value = false;
    }
  }
};

const handleDelete = async (id: string) => {
  try {
    await deleteItem(id);
    await loadItems();
  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || t("admin.delete_failed");
  }
};

const requestDeleteItem = (id: string, title: string) => {
  openConfirmDialog({
    title: t("admin.delete_item_title"),
    message: t("admin.delete_item_message", { name: title }),
    confirmLabel: t("admin.delete_confirm"),
    action: () => handleDelete(id)
  });
};

const handleBulkDelete = async () => {
  if (!selectedIds.value.length) return;
  try {
    const effectiveId = user.value?.id || devOwnerId.value;
    if (effectiveId) {
      await $fetch("/api/workspace-items/delete", {
        method: "POST",
        body: { ownerId: effectiveId, ids: selectedIds.value }
      });
    } else {
      const { error } = await supabase
        .from("workspace_items")
        .delete()
        .in("id", selectedIds.value);
      if (error) {
        throw error;
      }
    }

    selectedIds.value = [];
    await loadItems();
  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || t("admin.delete_selected_failed");
  }
};

const requestBulkDelete = () => {
  if (!selectedIds.value.length) return;
  openConfirmDialog({
    title: t("admin.delete_selected_title"),
    message: t("admin.delete_selected_message", { count: String(selectedIds.value.length) }),
    confirmLabel: t("admin.delete_confirm"),
    action: () => handleBulkDelete()
  });
};

const handleExport = async (selectedOnly = false) => {
  exporting.value = true;
  errorMessage.value = "";

  try {
    const data = await listItems(query.value);
    const filteredData = sortItems(applyFilters(data));
    const selectedData = selectedOnly
      ? filteredData.filter((item) => selectedIds.value.includes(item.id))
      : filteredData;
    const ids = selectedData.map((item) => item.id);

    let attachments: Attachment[] = [];
    if (ids.length) {
      const { data: attachmentData, error } = await supabase
        .from("attachments")
        .select("*")
        .in("item_id", ids);

      if (error) {
        throw error;
      }
      attachments = attachmentData ?? [];
    }

    const attachmentMap = new Map<string, { links: string[]; files: string[] }>();
    for (const attachment of attachments ?? []) {
      const current = attachmentMap.get(attachment.item_id) ?? { links: [], files: [] };
      if (attachment.type === "link") {
        current.links.push(attachment.url);
      } else {
        current.files.push(attachment.url);
      }
      attachmentMap.set(attachment.item_id, current);
    }

    const columns = EXPORT_COLUMNS;

    const formatDate = (value: string | null) => {
      if (!value) return "";
      const iso = new Date(value).toISOString();
      return iso.slice(0, 19).replace("T", " ");
    };

    const rows = selectedData.map((item) => {
      const related = attachmentMap.get(item.id);
      const fallbackProductUrl = related?.links?.[0] ?? "";
      const hasFile = (related?.files?.length ?? 0) > 0;
      const postStatus =
        item.status === "published" ? "publish" : item.status === "draft" ? "draft" : "private";
      const downloadable = item.downloadable || hasFile;
      const productUrl = item.product_url || fallbackProductUrl;
      const shortDescription = item.short_description ?? item.excerpt ?? "";
      const postContent = item.content_md ? $md.render(item.content_md) : "";
      const downloadableFiles = buildDownloadableFiles(item);
      const attributes = buildAttributeMap(item);
      const brandAttr = findAttribute(attributes, ["brand", "pa_brand"]);
      const engineAttr = findAttribute(attributes, ["engine", "pa_engine"]);
      const horsepowerAttr = findAttribute(attributes, ["horsepower", "pa_horsepower"]);

      return {
        post_title: item.title,
        post_name: item.slug,
        post_parent: "",
        ID: item.post_id ?? "",
        post_content: postContent,
        post_excerpt: shortDescription,
        post_status: postStatus,
        post_password: item.post_password ?? "",
        menu_order: item.menu_order ?? "0",
        post_date: item.post_date || formatDate(item.created_at ?? item.updated_at),
        post_author: item.post_author ?? "",
        comment_status: item.comment_status ?? "closed",
        sku: item.sku ?? item.slug,
        parent_sku: item.parent_sku ?? "",
        children: item.children ?? "",
        downloadable: toYesNo(downloadable),
        virtual: toYesNo(item.virtual),
        stock: "",
        regular_price: item.regular_price ?? "",
        sale_price: item.sale_price ?? "",
        weight: item.weight ?? "",
        length: item.length ?? "",
        width: item.width ?? "",
        height: item.height ?? "",
        tax_class: item.tax_class ?? "",
        stock_status: "instock",
        backorders: "no",
        sold_individually: "no",
        low_stock_amount: "",
        manage_stock: "no",
        tax_status: item.tax_status ?? "",
        upsell_ids: item.upsell_ids ?? "",
        crosssell_ids: item.crosssell_ids ?? "",
        featured: toYesNo(item.featured),
        purchase_note: item.purchase_note ?? "",
        sale_price_dates_from: item.sale_price_dates_from ?? "",
        sale_price_dates_to: item.sale_price_dates_to ?? "",
        download_limit: item.download_limit ?? "",
        download_expiry: item.download_expiry ?? "",
        product_url: productUrl,
        button_text: item.button_text ?? "",
        images: formatImagesForWoo(
          item.images ?? "",
          imageSeparator.value === "pipe" ? "|" : ","
        ),
        downloadable_files: downloadableFiles,
        product_page_url: productUrl,
        "meta:rank_math_title": item.rank_math_title ?? "",
        "meta:rank_math_description": item.rank_math_description ?? "",
        "meta:rank_math_facebook_title": item.rank_math_facebook_title ?? "",
        "meta:rank_math_facebook_description": item.rank_math_facebook_description ?? "",
        "meta:rank_math_facebook_image": item.rank_math_facebook_image ?? "",
        "meta:rank_math_twitter_title": item.rank_math_twitter_title ?? "",
        "meta:rank_math_twitter_description": item.rank_math_twitter_description ?? "",
        "meta:rank_math_twitter_image": item.rank_math_twitter_image ?? "",
        "meta:rank_math_focus_keyword": item.rank_math_focus_keyword ?? "",
        "meta:rank_math_canonical_url": item.rank_math_canonical_url ?? "",
        "meta:_global_unique_id": (item.gtin ?? "").trim(),
        "tax:product_brand": brandAttr?.values ?? "",
        "tax:product_type": item.product_type ?? "simple",
        "tax:product_visibility": item.visibility ?? "",
        "tax:product_cat": item.categories ?? "",
        "tax:product_tag": item.tags ?? "",
        "tax:product_shipping_class": item.shipping_class ?? "",
        "attribute:pa_brand": brandAttr?.values ?? "",
        "attribute_default:pa_brand": brandAttr?.defaultValue ?? "",
        "attribute:pa_engine": engineAttr?.values ?? "",
        "attribute_default:pa_engine": engineAttr?.defaultValue ?? "",
        "attribute:pa_horsepower": horsepowerAttr?.values ?? "",
        "attribute_default:pa_horsepower": horsepowerAttr?.defaultValue ?? ""
      };
    });

    const csv = toCsv(columns, rows);
    const env = csvFolder.value;
    const stamp = new Date().toISOString().slice(0, 10);
    const fileName = selectedOnly
      ? `${env}-products-selected-${stamp}.csv`
      : `${env}-products-${stamp}.csv`;
    downloadCsv(csv, fileName);
  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || "Failed to export CSV.";
  } finally {
    exporting.value = false;
  }
};

const triggerImport = () => {
  importError.value = "";
  importSummary.value = "";
  importDetails.value = [];
  previewOpen.value = false;
  previewHeaders.value = [];
  previewRows.value = [];
  previewRowCount.value = 0;
  previewFileName.value = "";
  previewData.value = null;
  importInput.value?.click();
};

const handleImportFile = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  importError.value = "";
  importSummary.value = "";
  importDetails.value = [];
  previewOpen.value = false;
  previewHeaders.value = [];
  previewRows.value = [];
  previewRowCount.value = 0;
  previewFileName.value = file.name;
  previewData.value = null;

  try {
    // Optional: keep a copy of the CSV in Supabase storage, separated by folder (production/test)
    const effectiveId = user.value?.id || devOwnerId.value;
    if (effectiveId) {
      const path = `${effectiveId}/${csvFolder.value}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("workspace").upload(path, file, { upsert: false });
      if (error) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", path);
        formData.append("ownerId", effectiveId);
        await $fetch("/api/workspace-files/upload", { method: "POST", body: formData }).catch(() => {});
      }
    }

    const text = await file.text();
    const parsed = parseCsv(text);
    if (!parsed.headers.length) {
      throw new Error("CSV file has no headers.");
    }

    const normalizedHeaders = parsed.headers.map(normalizeHeader);
    const hasWooHeaders =
      normalizedHeaders.includes("name") ||
      normalizedHeaders.includes("sku") ||
      normalizedHeaders.includes("published");
    const hasWordpressHeaders = normalizedHeaders.includes("post_title");

    if (!hasWooHeaders && !hasWordpressHeaders) {
      throw new Error(
        "CSV headers not recognized. Expected WooCommerce or WordPress export headers."
      );
    }

    previewData.value = parsed;
    previewRowCount.value = parsed.rows.length;
    previewHeaders.value = parsed.headers;
    previewRows.value = parsed.rows.slice(0, 5).map((cells) => {
      const row: Record<string, string> = {};
      parsed.headers.forEach((header, index) => {
        row[header] = cells[index] ?? "";
      });
      return row;
    });
    previewOpen.value = true;
  } catch (error) {
    const err = error as Error;
    importError.value = err.message || "Failed to read CSV.";
  } finally {
    if (importInput.value) {
      importInput.value.value = "";
    }
  }
};

const cancelPreview = () => {
  previewOpen.value = false;
  previewHeaders.value = [];
  previewRows.value = [];
  previewRowCount.value = 0;
  previewFileName.value = "";
  previewData.value = null;
};

const confirmImport = async () => {
  if (!previewData.value) return;

  importing.value = true;
  importError.value = "";
  importSummary.value = "";
  importDetails.value = [];

  try {
    const { headers, rows } = previewData.value;
    const normalizedHeaders = headers.map(normalizeHeader);
    const hasWordpressHeaders = normalizedHeaders.includes("post_title");

    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (const cells of rows) {
      const row: Record<string, string> = {};
      normalizedHeaders.forEach((key, index) => {
        row[key] = cells[index] ?? "";
      });

      const title = valueFor(row, ["name", "post_title"]);
      if (!title) {
        skipped += 1;
        continue;
      }

      const shortDescription = valueFor(row, ["short_description", "post_excerpt"]);
      const description = valueFor(row, ["description", "post_content"]);
      const publishedRaw = valueFor(row, ["published", "post_status"]);
      const status = hasWordpressHeaders
        ? (toStatusFromWordpress(publishedRaw) as ItemStatus)
        : (parseBoolean(publishedRaw) ? "published" : "draft");

      const stockRaw = valueFor(row, ["stock"]);
      const manageStockRaw = valueFor(row, ["manage_stock"]);
      const manageStock = manageStockRaw ? parseBoolean(manageStockRaw) : Boolean(stockRaw);

      try {
        await createItem({
          title,
          excerpt: shortDescription,
          content_md: description,
          status,
          featured: parseBoolean(valueFor(row, ["is_featured", "featured"])),
          folder: csvFolder.value,
          post_id: valueFor(row, ["id"]),
          post_password: valueFor(row, ["post_password"]),
          menu_order: valueFor(row, ["position", "menu_order"]),
          post_date: valueFor(row, ["post_date"]),
          post_author: valueFor(row, ["post_author"]),
          comment_status: toCommentStatus(
            valueFor(row, ["allow_customer_reviews", "comment_status"])
          ),
          sku: valueFor(row, ["sku"]),
          gtin: valueFor(row, ["meta:_global_unique_id", "gtin"]),
          parent_sku: valueFor(row, ["parent", "parent_sku"]),
          children: valueFor(row, ["grouped_products", "children"]),
          downloadable: parseBoolean(valueFor(row, ["downloadable"])),
          virtual: parseBoolean(valueFor(row, ["virtual"])),
          stock: stockRaw,
          regular_price: valueFor(row, ["regular_price"]),
          sale_price: valueFor(row, ["sale_price"]),
          weight: valueFor(row, ["weight_unit", "weight"]),
          length: valueFor(row, ["length_unit", "length"]),
          width: valueFor(row, ["width_unit", "width"]),
          height: valueFor(row, ["height_unit", "height"]),
          tax_class: valueFor(row, ["tax_class"]),
          stock_status: toStockStatus(valueFor(row, ["in_stock", "stock_status"])),
          backorders: toBackorders(valueFor(row, ["backorders_allowed", "backorders"])),
          sold_individually: parseBoolean(valueFor(row, ["sold_individually"])),
          low_stock_amount: valueFor(row, ["low_stock_amount"]),
          manage_stock: manageStock,
          tax_status: valueFor(row, ["tax_status"]),
          upsell_ids: valueFor(row, ["upsells", "upsell_ids"]),
          crosssell_ids: valueFor(row, ["cross_sells", "crosssell_ids"]),
          purchase_note: valueFor(row, ["purchase_note"]),
          sale_price_dates_from: valueFor(row, [
            "date_sale_price_starts",
            "sale_price_dates_from"
          ]),
          sale_price_dates_to: valueFor(row, ["date_sale_price_ends", "sale_price_dates_to"]),
          download_limit: valueFor(row, ["download_limit"]),
          download_expiry: valueFor(row, ["download_expiry_days", "download_expiry"]),
          product_url: valueFor(row, ["external_url", "product_url", "product_page_url"]),
          button_text: valueFor(row, ["button_text"]),
          product_type: valueFor(row, ["type", "tax_product_type", "product_type"]),
          categories: valueFor(row, ["categories", "tax_product_cat"]),
          tags: valueFor(row, ["tags", "tax_product_tag"]),
          images: valueFor(row, ["images"]),
          short_description: shortDescription,
          shipping_class: valueFor(row, ["shipping_class", "tax_product_shipping_class"]),
          visibility: valueFor(row, ["visibility_in_catalog", "tax_product_visibility"]),
          attr_1_name: valueFor(row, ["attribute_1_name"]),
          attr_1_values: valueFor(row, [
            "attribute_1_value_s",
            "attribute_1_value",
            "attribute_1_values"
          ]),
          attr_1_visible: parseBoolean(valueFor(row, ["attribute_1_visible"])),
          attr_1_global: parseBoolean(valueFor(row, ["attribute_1_global"])),
          attr_1_default: valueFor(row, ["attribute_1_default"]),
          attr_2_name: valueFor(row, ["attribute_2_name"]),
          attr_2_values: valueFor(row, [
            "attribute_2_value_s",
            "attribute_2_value",
            "attribute_2_values"
          ]),
          attr_2_visible: parseBoolean(valueFor(row, ["attribute_2_visible"])),
          attr_2_global: parseBoolean(valueFor(row, ["attribute_2_global"])),
          attr_2_default: valueFor(row, ["attribute_2_default"]),
          attr_3_name: valueFor(row, ["attribute_3_name"]),
          attr_3_values: valueFor(row, [
            "attribute_3_value_s",
            "attribute_3_value",
            "attribute_3_values"
          ]),
          attr_3_visible: parseBoolean(valueFor(row, ["attribute_3_visible"])),
          attr_3_global: parseBoolean(valueFor(row, ["attribute_3_global"])),
          attr_3_default: valueFor(row, ["attribute_3_default"]),
          download_1_name: valueFor(row, ["download_1_name"]),
          download_1_url: valueFor(row, ["download_1_url"]),
          download_2_name: valueFor(row, ["download_2_name"]),
          download_2_url: valueFor(row, ["download_2_url"]),
          rank_math_title: valueFor(row, ["meta_rank_math_title"]),
          rank_math_description: valueFor(row, ["meta_rank_math_description"]),
          rank_math_facebook_title: valueFor(row, ["meta_rank_math_facebook_title"]),
          rank_math_facebook_description: valueFor(row, [
            "meta_rank_math_facebook_description"
          ]),
          rank_math_facebook_image: valueFor(row, ["meta_rank_math_facebook_image"]),
          rank_math_twitter_title: valueFor(row, ["meta_rank_math_twitter_title"]),
          rank_math_twitter_description: valueFor(row, ["meta_rank_math_twitter_description"]),
          rank_math_twitter_image: valueFor(row, ["meta_rank_math_twitter_image"]),
          rank_math_focus_keyword: valueFor(row, ["meta_rank_math_focus_keyword"]),
          rank_math_canonical_url: valueFor(row, ["meta_rank_math_canonical_url"])
        });

        imported += 1;
      } catch (error) {
        failed += 1;
        const err = error as Error;
        if (importDetails.value.length < 5) {
          importDetails.value.push(
            `${title || "Untitled"}: ${err.message || "Failed to import row."}`
          );
        }
      }
    }

    await loadItems();
    importSummary.value = `Imported ${imported} item(s). Skipped ${skipped}. Failed ${failed}.`;
    if (failed > 0 && !importError.value) {
      importError.value = `Some rows failed to import. Showing the first ${importDetails.value.length} error(s) below.`;
    }
    cancelPreview();
  } catch (error) {
    const err = error as Error;
    importError.value = err.message || "Failed to import CSV.";
  } finally {
    importing.value = false;
  }
};

const toggleTextCsv = () => {
  textCsvOpen.value = !textCsvOpen.value;
  textCsvError.value = "";
  textCsvSummary.value = "";
  if (textCsvOpen.value) {
    textCsvFolder.value = csvFolder.value;
    if (!textCsvFileName.value.trim()) {
      textCsvFileName.value = `text-export-${new Date().toISOString().slice(0, 10)}`;
    }
  }
};

const resetTextCsv = () => {
  textCsvInput.value = "";
  textCsvFileName.value = "";
  textCsvError.value = "";
  textCsvSummary.value = "";
  textCsvDownload.value = true;
  textCsvSaveStorage.value = true;
};

const buildTextCsvPayload = () => {
  const raw = textCsvInput.value.trim();
  if (!raw) {
    throw new Error("Paste some text first.");
  }
  const delimiter =
    textCsvDelimiter.value === "auto"
      ? detectDelimiter(raw)
      : textCsvDelimiter.value === "tab"
        ? "\t"
        : textCsvDelimiter.value;
  const rows = parseDelimitedRows(raw, delimiter);
  if (!rows.length) {
    throw new Error("No rows detected in the pasted text.");
  }
  const columnCount = Math.max(...rows.map((row) => row.length));
  if (!columnCount) {
    throw new Error("No columns detected in the pasted text.");
  }
  let headers: string[] = [];
  let dataRows = rows;
  if (textCsvHasHeader.value) {
    const headerRow = rows[0] ?? [];
    dataRows = rows.slice(1);
    headers = Array.from({ length: columnCount }, (_, index) =>
      normalizeTextHeader(headerRow[index] ?? "", index)
    );
  } else {
    headers = Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`);
  }
  if (!dataRows.length) {
    throw new Error("No data rows found after the header.");
  }
  return { headers, dataRows, delimiter };
};

const convertTextCsv = async () => {
  textCsvError.value = "";
  textCsvSummary.value = "";

  try {
    if (!textCsvDownload.value && !textCsvSaveStorage.value) {
      throw new Error("Choose download or save to folder before converting.");
    }
    const { headers, dataRows } = buildTextCsvPayload();
    const rows = dataRows.map((cells) => {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = (cells[index] ?? "").trim();
      });
      return row;
    });

    const csv = toCsv(headers, rows);
    const baseName = textCsvFileName.value.trim() || `text-export-${Date.now()}`;
    const fileName = baseName.toLowerCase().endsWith(".csv") ? baseName : `${baseName}.csv`;
    let summaryParts: string[] = [];
    if (textCsvDownload.value) {
      downloadCsv(csv, fileName);
      summaryParts.push(`Downloaded ${rows.length} row(s).`);
    }

    if (textCsvSaveStorage.value) {
      const effectiveId = user.value?.id || devOwnerId.value;
      if (!effectiveId) {
        summaryParts.push("Sign in to save a copy to storage.");
      } else {
        const folder = textCsvFolder.value || csvFolder.value;
        const path = `${effectiveId}/${folder}/${Date.now()}-${fileName}`;
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const { error } = await supabase.storage
          .from("workspace")
          .upload(path, blob, { upsert: false });
        if (error) {
          try {
            const formData = new FormData();
            formData.append(
              "file",
              new File([blob], fileName, { type: "text/csv;charset=utf-8;" })
            );
            formData.append("path", path);
            formData.append("ownerId", effectiveId);
            await $fetch("/api/workspace-files/upload", {
              method: "POST",
              body: formData
            });
          } catch (fallbackErr: any) {
            textCsvError.value =
              error.message || fallbackErr?.message || "Failed to save CSV to storage.";
          }
        } else {
          summaryParts.push(`Saved to ${folder}.`);
          await createItem({
            title: baseName,
            excerpt: `CSV file: ${fileName}`,
            content_md: `Stored CSV at ${path}`,
            status: "private",
            featured: false,
            folder
          });
          await loadItems();
        }
      }
    }
    textCsvSummary.value = summaryParts.join(" ");
  } catch (error) {
    const err = error as Error;
    textCsvError.value = err.message || "Failed to convert text to CSV.";
  }
};

watch(query, () => {
  loadItems();
});

watch(csvFolder, () => {
  selectedIds.value = [];
  if (!csvFolders.value.includes(textCsvFolder.value)) {
    textCsvFolder.value = csvFolder.value;
  }
  if (!foldersReady.value) return;
  if (!(user.value?.id || devOwnerId.value)) return;
  updateActiveFolder(csvFolder.value);
});

watch(
  () => user.value?.id || devOwnerId.value,
  async (id) => {
    if (!id) {
      csvFolders.value = [];
      csvFolder.value = "production";
      textCsvFolder.value = "production";
      return;
    }
    await loadFolders();
    await loadItems();
  },
  { immediate: true }
);

onMounted(() => {
  try {
    const storedType = localStorage.getItem(PRODUCT_TYPE_KEY);
    if (storedType && categoryOptions.includes(storedType)) {
      categoryFilter.value = storedType;
    }
  } catch {
    // ignore
  }
  try {
    const stored = localStorage.getItem(IMAGE_SEPARATOR_KEY);
    if (stored === "pipe" || stored === "comma" || stored === "auto") {
      imageSeparator.value = stored === "pipe" ? "pipe" : "comma";
    }
  } catch {
    // ignore
  }
});

watch(imageSeparator, (value) => {
  try {
    localStorage.setItem(IMAGE_SEPARATOR_KEY, value);
  } catch {
    // ignore
  }
});

watch(categoryFilter, (value) => {
  try {
    localStorage.setItem(PRODUCT_TYPE_KEY, value);
  } catch {
    // ignore
  }
});
</script>
