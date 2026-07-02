<template>
  <section class="page-shell page-form page-edit">
    <div class="page-surface">
      <div class="compact-shell fade-up edit-shell">
        <div v-if="loading" class="panel p-4 text-xs text-slate-400">
          Loading item...
        </div>

        <div v-else-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <div v-else class="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <form id="edit-item-form" class="create-form compact-form edit-form" @submit.prevent="handleSave">
            <header class="create-hero">
              <div class="create-hero-main">
                <span class="section-kicker">Edit item</span>
                <h1 class="section-title">Update this listing</h1>
                <p class="section-subtitle">
                  Adjust details fast. Core data on top, then pricing, media, and metadata.
                </p>
              </div>
            </header>

            <section class="panel create-section" id="core-details">
              <div class="create-section-header">
                <span class="create-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                  </svg>
                </span>
                <div>
                  <h2 class="create-section-title">Core details</h2>
                  <p class="create-section-subtitle">Name, description, status, and workspace folder.</p>
                </div>
              </div>
              <div class="create-section-body">
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Name (Title)</label>
                    <input
                      v-model="form.title"
                      type="text"
                      required
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Title"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Slug (auto)</label>
                    <input
                      :value="slugPreview"
                      type="text"
                      disabled
                      class="mt-1 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Published status</label>
                    <select
                      v-model="form.status"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div class="create-toggle-card self-end">
                    <input id="featured" v-model="form.featured" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                    <div>
                      <p class="create-toggle-title">Featured</p>
                      <span class="create-toggle-copy">Highlight in catalogs</span>
                    </div>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Folder</label>
                    <select
                      v-model="form.folder"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    >
                      <option v-for="folder in folderOptions" :key="folder" :value="folder">
                        {{ folder }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="grid gap-3 lg:grid-cols-3">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Excerpt</label>
                    <textarea
                      v-model="form.excerpt"
                      rows="2"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Sum"
                    ></textarea>
                  </div>

                  <div class="lg:col-span-2">
                    <label class="text-sm font-medium text-slate-700">Description (Markdown)</label>
                    <textarea
                      v-model="form.content_md"
                      rows="2"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Listing"
                    ></textarea>
                  </div>
                </div>
              </div>
            </section>

            <section class="panel create-section" id="commerce">
              <div class="create-section-header">
                <span class="create-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.59 13.41L11 3H3v8l9.59 9.59a2 2 0 0 0 2.82 0l5.18-5.18a2 2 0 0 0 0-2.82z"></path>
                    <circle cx="7.5" cy="7.5" r="1.5"></circle>
                  </svg>
                </span>
                <div>
                  <h2 class="create-section-title">Commerce</h2>
                  <p class="create-section-subtitle">IDs, SKU, visibility, and pricing rules.</p>
                </div>
              </div>
              <div class="create-section-body">
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  <div>
                    <label class="text-sm font-medium text-slate-700">ID</label>
                    <input
                      v-model="form.post_id"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="ID"
                    />
                  </div>
                    <div>
                      <label class="text-sm font-medium text-slate-700">SKU</label>
                      <input
                        v-model="form.sku"
                        type="text"
                        class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        placeholder="SKU"
                      />
                    </div>
                    <div>
                      <label class="text-sm font-medium text-slate-700">GTIN</label>
                      <input
                        v-model="form.gtin"
                        type="text"
                        class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                        placeholder="GTIN"
                      />
                    </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Type</label>
                    <select
                      v-model="form.product_type"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    >
                      <option value="simple">simple</option>
                      <option value="variable">variable</option>
                      <option value="variation">variation</option>
                      <option value="grouped">grouped</option>
                      <option value="external">external</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Visibility</label>
                    <select
                      v-model="form.visibility"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    >
                      <option value="">(default)</option>
                      <option value="visible">visible</option>
                      <option value="catalog">catalog</option>
                      <option value="search">search</option>
                      <option value="hidden">hidden</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Regular</label>
                    <input
                      v-model="form.regular_price"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Reg"
                    />
                  </div>
                </div>
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Sale</label>
                    <input
                      v-model="form.sale_price"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Sale"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Sale start</label>
                    <input
                      v-model="form.sale_price_dates_from"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Start"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Sale end</label>
                    <input
                      v-model="form.sale_price_dates_to"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="End"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section class="panel create-section" id="catalog-media">
              <div class="create-section-header">
                <span class="create-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <path d="M21 15l-5-5L5 21"></path>
                  </svg>
                </span>
                <div>
                  <h2 class="create-section-title">Catalog & media</h2>
                  <p class="create-section-subtitle">Categories, tags, WebP URLs, and highlight copy.</p>
                </div>
              </div>
              <div class="create-section-body">
                <div class="grid gap-3 lg:grid-cols-[1.1fr,1.4fr]">
                  <div class="category-panel">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Category</p>
                        <p class="text-sm text-slate-300">Pick a primary machine type.</p>
                      </div>
                      <span class="meta-pill">Auto tags</span>
                    </div>
                    <div class="category-picker">
                      <button
                        v-for="option in categoryOptions"
                        :key="option"
                        type="button"
                        :class="['category-option', selectedCategory === option && 'category-option-active']"
                        @click="selectedCategory = option"
                      >
                        {{ option }}
                      </button>
                    </div>
                    <div class="attachment-panel">
                      <p class="attachment-title">Attachments</p>
                      <p v-if="!selectedCategory" class="text-xs text-slate-400">
                        Select a category to load recommended attachments.
                      </p>
                      <div v-else class="attachment-grid">
                        <label
                          v-for="attachment in attachmentOptions"
                          :key="attachment"
                          class="attachment-card"
                        >
                          <input
                            type="checkbox"
                            :value="attachment"
                            v-model="selectedAttachments"
                          />
                          <span>{{ attachment }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="grid gap-3">
                    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label class="text-sm font-medium text-slate-700">Categories (manual)</label>
                        <input
                          v-model="form.categories"
                          type="text"
                          class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                          placeholder="Cat"
                        />
                      </div>
                      <div>
                        <label class="text-sm font-medium text-slate-700">Tags</label>
                        <input
                          v-model="form.tags"
                          type="text"
                          class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                          placeholder="Tags"
                        />
                      </div>
                      <div>
                        <label class="text-sm font-medium text-slate-700">Short description</label>
                        <textarea
                          v-model="form.short_description"
                          rows="2"
                          class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                          placeholder="Teaser"
                        ></textarea>
                      </div>
                    </div>

                    <div class="rounded-xl border border-dashed border-slate-300/70 bg-white/5 px-3 py-2 text-xs text-slate-500">
                      Product images are managed in the right-side image panel.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <details class="panel create-section" id="inventory" open>
              <summary class="create-section-summary">
                <span class="create-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.29 7 12 12 20.71 7"></polyline>
                    <line x1="12" y1="22" x2="12" y2="12"></line>
                  </svg>
                </span>
                <div>
                  <span class="create-section-title">Inventory</span>
                  <span class="create-section-subtitle">Stock counts and availability rules.</span>
                </div>
              </summary>
              <div class="create-section-body">
                <div class="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Inventory locked</p>
                  <p class="mt-1 text-sm text-emerald-900">This product is always exported as in stock.</p>
                  <div class="mt-3 flex flex-wrap gap-2 text-xs">
                    <span class="rounded-full border border-emerald-300/80 bg-white px-2.5 py-1 font-medium text-emerald-800">
                      Stock status: instock
                    </span>
                    <span class="rounded-full border border-emerald-300/80 bg-white px-2.5 py-1 font-medium text-emerald-800">
                      Backorders: no
                    </span>
                    <span class="rounded-full border border-emerald-300/80 bg-white px-2.5 py-1 font-medium text-emerald-800">
                      Manage stock: off
                    </span>
                  </div>
                </div>
              </div>
            </details>

            <details class="panel create-section" id="shipping-tax" open>
              <summary class="create-section-summary">
                <span class="create-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="2"></rect>
                    <path d="M16 8h4l3 4v4h-7"></path>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                  </svg>
                </span>
                <div>
                  <span class="create-section-title">Shipping & tax</span>
                  <span class="create-section-subtitle">Dimensions, freight class, and tax settings.</span>
                </div>
              </summary>
              <div class="create-section-body">
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Shipping class</label>
                    <input
                      v-model="form.shipping_class"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Ship"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Tax status</label>
                    <input
                      v-model="form.tax_status"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Tax"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Tax class</label>
                    <input
                      v-model="form.tax_class"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Class"
                    />
                  </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Weight</label>
                    <input
                      v-model="form.weight"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Wgt"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Length</label>
                    <input
                      v-model="form.length"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Len"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Width</label>
                    <input
                      v-model="form.width"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Wid"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Height</label>
                    <input
                      v-model="form.height"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Hgt"
                    />
                  </div>
                </div>
              </div>
            </details>

            <details class="panel create-section" id="external-downloads" open>
              <summary class="create-section-summary">
                <span class="create-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </span>
                <div>
                  <span class="create-section-title">External & downloads</span>
                  <span class="create-section-subtitle">Links, button text, and downloadable assets.</span>
                </div>
              </summary>
              <div class="create-section-body">
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label class="text-sm font-medium text-slate-700">External URL</label>
                    <input
                      v-model="form.product_url"
                      type="url"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="URL"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Button text</label>
                    <input
                      v-model="form.button_text"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Btn"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Download limit</label>
                    <input
                      v-model="form.download_limit"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Limit"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Download expiry</label>
                    <input
                      v-model="form.download_expiry"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Exp"
                    />
                  </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Download 1 name</label>
                    <input
                      v-model="form.download_1_name"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Spec"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Download 1 URL</label>
                    <input
                      v-model="form.download_1_url"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="URL"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Download 2 name</label>
                    <input
                      v-model="form.download_2_name"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Warr"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Download 2 URL</label>
                    <input
                      v-model="form.download_2_url"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="URL"
                    />
                  </div>
                </div>

                <div class="grid gap-3 lg:grid-cols-3">
                  <div class="lg:col-span-3">
                    <label class="text-sm font-medium text-slate-700">Purchase Note</label>
                    <textarea
                      v-model="form.purchase_note"
                      rows="2"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Note"
                    ></textarea>
                  </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="create-toggle-card">
                    <input id="downloadable" v-model="form.downloadable" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                    <div>
                      <p class="create-toggle-title">Downloadable</p>
                      <span class="create-toggle-copy">Digital asset or PDF</span>
                    </div>
                  </div>
                  <div class="create-toggle-card">
                    <input id="virtual" v-model="form.virtual" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                    <div>
                      <p class="create-toggle-title">Virtual</p>
                      <span class="create-toggle-copy">No physical shipping</span>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            <details class="panel create-section" open>
              <summary class="create-section-summary">
                <span class="create-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"></path>
                    <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"></path>
                  </svg>
                </span>
                <div>
                  <span class="create-section-title">Relations</span>
                  <span class="create-section-subtitle">Upsells, cross-sells, and grouped items.</span>
                </div>
              </summary>
              <div class="create-section-body">
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Upsells</label>
                    <input
                      v-model="form.upsell_ids"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="SKU"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Cross-sells</label>
                    <input
                      v-model="form.crosssell_ids"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="SKU"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Parent (SKU)</label>
                    <input
                      v-model="form.parent_sku"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Parent"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Grouped products</label>
                    <input
                      v-model="form.children"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Child"
                    />
                  </div>
                </div>
              </div>
            </details>

            <details class="panel create-section" open>
              <summary class="create-section-summary">
                <span class="create-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                </span>
                <div>
                  <span class="create-section-title">Attributes</span>
                  <span class="create-section-subtitle">Custom attributes and defaults.</span>
                </div>
              </summary>
              <div class="create-section-body">
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Attribute 1 name</label>
                    <input
                      v-model="form.attr_1_name"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Attribute 1 value(s)</label>
                    <input
                      v-model="form.attr_1_values"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Vals"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Attribute 1 default</label>
                    <input
                      v-model="form.attr_1_default"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Def"
                    />
                  </div>
                  <div class="create-toggle-card self-end">
                    <input id="attr_1_visible" v-model="form.attr_1_visible" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                    <div>
                      <p class="create-toggle-title">Visible</p>
                      <span class="create-toggle-copy">Show on product page</span>
                    </div>
                  </div>
                  <div class="create-toggle-card self-end">
                    <input id="attr_1_global" v-model="form.attr_1_global" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                    <div>
                      <p class="create-toggle-title">Global</p>
                      <span class="create-toggle-copy">Use global attribute</span>
                    </div>
                  </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Attribute 2 name</label>
                    <input
                      v-model="form.attr_2_name"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Attribute 2 value(s)</label>
                    <input
                      v-model="form.attr_2_values"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Vals"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Attribute 2 default</label>
                    <input
                      v-model="form.attr_2_default"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Def"
                    />
                  </div>
                  <div class="create-toggle-card self-end">
                    <input id="attr_2_visible" v-model="form.attr_2_visible" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                    <div>
                      <p class="create-toggle-title">Visible</p>
                      <span class="create-toggle-copy">Show on product page</span>
                    </div>
                  </div>
                  <div class="create-toggle-card self-end">
                    <input id="attr_2_global" v-model="form.attr_2_global" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                    <div>
                      <p class="create-toggle-title">Global</p>
                      <span class="create-toggle-copy">Use global attribute</span>
                    </div>
                  </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Attribute 3 name</label>
                    <input
                      v-model="form.attr_3_name"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Attribute 3 value(s)</label>
                    <input
                      v-model="form.attr_3_values"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Vals"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Attribute 3 default</label>
                    <input
                      v-model="form.attr_3_default"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Def"
                    />
                  </div>
                  <div class="create-toggle-card self-end">
                    <input id="attr_3_visible" v-model="form.attr_3_visible" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                    <div>
                      <p class="create-toggle-title">Visible</p>
                      <span class="create-toggle-copy">Show on product page</span>
                    </div>
                  </div>
                  <div class="create-toggle-card self-end">
                    <input id="attr_3_global" v-model="form.attr_3_global" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                    <div>
                      <p class="create-toggle-title">Global</p>
                      <span class="create-toggle-copy">Use global attribute</span>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            <details class="panel create-section" open>
              <summary class="create-section-summary">
                <span class="create-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                  </svg>
                </span>
                <div>
                  <span class="create-section-title">Post meta</span>
                  <span class="create-section-subtitle">Publish settings and author details.</span>
                </div>
              </summary>
              <div class="create-section-body">
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Post password</label>
                    <input
                      v-model="form.post_password"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="None"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Position</label>
                    <input
                      v-model="form.menu_order"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Published date</label>
                    <input
                      v-model="form.post_date"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Date"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Post author</label>
                    <input
                      v-model="form.post_author"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Author"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Comments</label>
                    <select
                      v-model="form.comment_status"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    >
                      <option value="open">yes (open)</option>
                      <option value="closed">no (closed)</option>
                    </select>
                  </div>
                </div>
              </div>
            </details>

            <details class="panel create-section" open>
              <summary class="create-section-summary">
                <span class="create-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="7"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <div>
                  <span class="create-section-title">Rank Math SEO</span>
                  <span class="create-section-subtitle">Search previews and social cards.</span>
                </div>
              </summary>
              <div class="create-section-body">
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Rank Math title</label>
                    <input
                      v-model="form.rank_math_title"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="SEO"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Focus keyword</label>
                    <input
                      v-model="form.rank_math_focus_keyword"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Key"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Canonical URL</label>
                    <input
                      v-model="form.rank_math_canonical_url"
                      type="url"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="URL"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">SEO description</label>
                    <textarea
                      v-model="form.rank_math_description"
                      rows="2"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="SEO"
                    ></textarea>
                  </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Facebook title</label>
                    <input
                      v-model="form.rank_math_facebook_title"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="OG"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Facebook description</label>
                    <input
                      v-model="form.rank_math_facebook_description"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="OG"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Facebook image URL</label>
                    <input
                      v-model="form.rank_math_facebook_image"
                      type="url"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="URL"
                    />
                  </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label class="text-sm font-medium text-slate-700">Twitter title</label>
                    <input
                      v-model="form.rank_math_twitter_title"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Tw"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Twitter description</label>
                    <input
                      v-model="form.rank_math_twitter_description"
                      type="text"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="Tw"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-slate-700">Twitter image URL</label>
                    <input
                      v-model="form.rank_math_twitter_image"
                      type="url"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      placeholder="URL"
                    />
                  </div>
                </div>
              </div>
            </details>

            <div class="create-actions">
              <div v-if="saveMessage" class="alert alert-success">
                {{ saveMessage }}
              </div>
              <div v-if="saveError" class="alert alert-error">
                {{ saveError }}
              </div>
            </div>
          </form>

          <aside class="space-y-4 lg:sticky lg:top-20 lg:self-start edit-sidebar">
            <section id="product-images" class="panel create-section edit-media-panel">
              <div class="create-section-header">
                <span class="create-section-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <path d="M21 15l-5-5L5 21"></path>
                  </svg>
                </span>
                <div>
                  <h2 class="create-section-title">Product images</h2>
                  <p class="create-section-subtitle">Pick, order, and sync image URLs for WordPress.</p>
                </div>
              </div>
              <div class="create-section-body">
                <ProductImagesField
                  v-model="productImages"
                  v-model:text-value="form.images"
                  label="Images (comma separated URLs)"
                />
              </div>
            </section>
          </aside>

        </div>
      </div>
    </div>

    <Teleport v-if="!loading && !errorMessage" to="body">
      <div class="create-actions-row create-actions-floating">
        <button
          type="submit"
          form="edit-item-form"
          class="btn-primary create-action-pill"
          :disabled="saving"
        >
          {{ saving ? "Saving..." : "Save changes" }}
        </button>
        <NuxtLink to="/admin" class="btn-ghost create-action-pill">
          Back to admin
        </NuxtLink>
      </div>
    </Teleport>
  </section>
</template>


<script setup lang="ts">
import { slugify } from "~/utils/slug";
import { parseImagesField } from "~/utils/parseImagesField";
import { joinImagesForWoo } from "~/utils/joinImagesForWoo";
import type { ItemStatus, WorkspaceItem, ProductImage } from "~/types/db";

const route = useRoute();
const { getItemById, updateItem } = useItems();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const runtimeConfig = useRuntimeConfig();
const devOwnerId = computed(() => runtimeConfig.public.devOwnerId || "");

const item = ref<WorkspaceItem | null>(null);
const loading = ref(true);
const errorMessage = ref("");
const folderOptions = ref<string[]>(["production"]);
const FOLDER_KEY = "csvFolders";

const form = reactive({
  title: "",
  excerpt: "",
  content_md: "",
  status: "private" as ItemStatus,
  featured: false,
  folder: "production",
  post_id: "",
  post_password: "",
  menu_order: "",
  post_date: "",
  post_author: "",
  comment_status: "closed",
  product_type: "simple",
  categories: "",
  tags: "",
  images: "",
  short_description: "",
  shipping_class: "",
  visibility: "",
  sku: "",
  gtin: "",
  parent_sku: "",
  children: "",
  downloadable: false,
  virtual: false,
  stock: "",
  regular_price: "",
  sale_price: "",
  weight: "",
  length: "",
  width: "",
  height: "",
  tax_class: "",
  stock_status: "instock",
  backorders: "no",
  sold_individually: false,
  low_stock_amount: "",
  manage_stock: false,
  tax_status: "",
  upsell_ids: "",
  crosssell_ids: "",
  purchase_note: "",
  sale_price_dates_from: "",
  sale_price_dates_to: "",
  download_limit: "",
  download_expiry: "",
  product_url: "",
  button_text: "",
  attr_1_name: "",
  attr_1_values: "",
  attr_1_visible: false,
  attr_1_global: false,
  attr_1_default: "",
  attr_2_name: "",
  attr_2_values: "",
  attr_2_visible: false,
  attr_2_global: false,
  attr_2_default: "",
  attr_3_name: "",
  attr_3_values: "",
  attr_3_visible: false,
  attr_3_global: false,
  attr_3_default: "",
  download_1_name: "",
  download_1_url: "",
  download_2_name: "",
  download_2_url: "",
  rank_math_title: "",
  rank_math_description: "",
  rank_math_facebook_title: "",
  rank_math_facebook_description: "",
  rank_math_facebook_image: "",
  rank_math_twitter_title: "",
  rank_math_twitter_description: "",
  rank_math_twitter_image: "",
  rank_math_focus_keyword: "",
  rank_math_canonical_url: ""
});

const productImages = ref<ProductImage[]>([]);

const saving = ref(false);
const saveMessage = ref("");
const saveError = ref("");

const session = useSupabaseSession();

const categoryOptions = [
  "Mini Excavator",
  "Skid Steer",
  "Forklift",
  "Road Roller"
];

const attachmentsByCategory: Record<string, string[]> = {
  "Mini Excavator": ["Bucket", "Auger", "Breaker", "Grapple", "Quick Coupler"],
  "Skid Steer": ["Bucket", "Pallet Forks", "Auger", "Grapple", "Trencher"],
  Forklift: ["Forks", "Side Shifter", "Work Platform", "Drum Clamp", "Paper Roll Clamp"],
  "Road Roller": ["Vibration Kit", "Water Tank", "Scraper Bar", "Canopy", "LED Work Lights"]
};

const selectedCategory = ref("");
const selectedAttachments = ref<string[]>([]);

const attachmentOptions = computed(
  () => attachmentsByCategory[selectedCategory.value] ?? []
);

const parseList = (value: string) =>
  value
    .split(/\s*\|\s*|\s*,\s*/g)
    .map((entry) => entry.trim())
    .filter(Boolean);

const syncAttachments = () => {
  const values = selectedAttachments.value.join(" | ");
  if (selectedAttachments.value.length) {
    form.attr_3_name = "Attachments";
    form.attr_3_values = values;
    form.attr_3_visible = true;
  } else {
    form.attr_3_values = "";
  }
};

watch(selectedCategory, (value) => {
  form.categories = value;
  selectedAttachments.value = [];
  syncAttachments();
});

watch(
  selectedAttachments,
  () => {
    syncAttachments();
  },
  { deep: true }
);

watch(
  () => form.categories,
  (value) => {
    if (!value) return;
    const match = categoryOptions.find((option) =>
      value.toLowerCase().includes(option.toLowerCase())
    );
    if (match && match !== selectedCategory.value) {
      selectedCategory.value = match;
    }
  }
);

const slugPreview = computed(() => slugify(form.title));

const loadFolderOptions = async () => {
  folderOptions.value = [];
  try {
    const effectiveId = user.value?.id || devOwnerId.value;
    const response = await $fetch<{ items?: Array<{ name: string; owner_id?: string }> }>(
      "/api/workspace-folders/list",
      { query: effectiveId ? { ownerId: effectiveId } : {} }
    );
    const raw = response?.items ?? [];
    const scoped = effectiveId ? raw.filter((row) => row.owner_id === effectiveId) : raw;
    const names = [...new Set(scoped.map((row) => row.name).filter(Boolean))];
    if (names.length) {
      folderOptions.value = names;
      return;
    }
  } catch {
    // ignore and fall back below
  }
  if (!folderOptions.value.length && user.value) {
    try {
      const { data, error } = await supabase
        .from("workspace_folders")
        .select("name,is_active")
        .eq("owner_id", user.value.id)
        .order("created_at", { ascending: true });
      if (error) {
        throw error;
      }
      if (data?.length) {
        folderOptions.value = data.map((row) => row.name);
        return;
      }
    } catch {
      // fall back to localStorage below
    }
  }
  try {
    const stored = localStorage.getItem(FOLDER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every((f) => typeof f === "string" && f.trim())) {
        folderOptions.value = parsed;
      }
    }
  } catch (e) {
    // ignore
  }
};

const ensureFolderExists = async (name: string) => {
  const clean = name.trim();
  const effectiveId = user.value?.id || devOwnerId.value;
  if (!clean || !effectiveId) return;
  try {
    await $fetch("/api/workspace-folders/ensure", {
      method: "POST",
      body: { name: clean, ownerId: effectiveId }
    });
    return;
  } catch (error) {
    const err = error as Error;
    console.warn("workspace_folders ensure failed:", err.message);
  }
  try {
    if (!user.value?.id) return;
    const { error } = await supabase
      .from("workspace_folders")
      .upsert({ owner_id: user.value.id, name: clean, is_active: false }, { onConflict: "owner_id,name" });
    if (error) {
      throw error;
    }
  } catch (fallbackError) {
    const fallbackErr = fallbackError as Error;
    if (session.value?.access_token) {
      console.warn("workspace_folders ensure failed:", fallbackErr.message);
    }
  }
};

let folderSaveTimer: ReturnType<typeof setTimeout> | null = null;
watch(
  () => form.folder,
  (value) => {
    if (!value) return;
    if (folderSaveTimer) {
      clearTimeout(folderSaveTimer);
    }
    folderSaveTimer = setTimeout(() => {
      ensureFolderExists(value);
    }, 400);
  }
);

const loadItem = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const id = route.params.id as string;
    item.value = await getItemById(id);
    form.title = item.value.title;
    form.excerpt = item.value.excerpt ?? "";
    form.content_md = item.value.content_md ?? "";
    form.status = item.value.status;
    form.featured = item.value.featured;
    form.folder = item.value.folder ?? "production";
    if (!folderOptions.value.includes(form.folder)) {
      folderOptions.value = [...folderOptions.value, form.folder];
    }
    form.post_id = item.value.post_id ?? "";
    form.post_password = item.value.post_password ?? "";
    form.menu_order = item.value.menu_order ?? "";
    form.post_date = item.value.post_date ?? "";
    form.post_author = item.value.post_author ?? "";
    form.comment_status = item.value.comment_status ?? "closed";
    form.product_type = item.value.product_type ?? "simple";
    form.categories = item.value.categories ?? "";
    form.tags = item.value.tags ?? "";
    form.images = item.value.images ?? "";
    productImages.value = parseImagesField(form.images).map((url, index) => ({
      url,
      alt: "",
      is_primary: index === 0,
      sort_order: index
    }));
    form.short_description = item.value.short_description ?? "";
    form.shipping_class = item.value.shipping_class ?? "";
    form.visibility = item.value.visibility ?? "";
    form.sku = item.value.sku ?? "";
    form.gtin = item.value.gtin ?? "";
    form.parent_sku = item.value.parent_sku ?? "";
    form.children = item.value.children ?? "";
    form.downloadable = item.value.downloadable ?? false;
    form.virtual = item.value.virtual ?? false;
    form.regular_price = item.value.regular_price ?? "";
    form.sale_price = item.value.sale_price ?? "";
    form.weight = item.value.weight ?? "";
    form.length = item.value.length ?? "";
    form.width = item.value.width ?? "";
    form.height = item.value.height ?? "";
    form.tax_class = item.value.tax_class ?? "";
    form.stock = "";
    form.stock_status = "instock";
    form.backorders = "no";
    form.sold_individually = false;
    form.low_stock_amount = "";
    form.manage_stock = false;
    form.tax_status = item.value.tax_status ?? "";
    form.upsell_ids = item.value.upsell_ids ?? "";
    form.crosssell_ids = item.value.crosssell_ids ?? "";
    form.purchase_note = item.value.purchase_note ?? "";
    form.sale_price_dates_from = item.value.sale_price_dates_from ?? "";
    form.sale_price_dates_to = item.value.sale_price_dates_to ?? "";
    form.download_limit = item.value.download_limit ?? "";
    form.download_expiry = item.value.download_expiry ?? "";
    form.product_url = item.value.product_url ?? "";
    form.button_text = item.value.button_text ?? "";
    form.attr_1_name = item.value.attr_1_name ?? "";
    form.attr_1_values = item.value.attr_1_values ?? "";
    form.attr_1_visible = item.value.attr_1_visible ?? false;
    form.attr_1_global = item.value.attr_1_global ?? false;
    form.attr_1_default = item.value.attr_1_default ?? "";
    form.attr_2_name = item.value.attr_2_name ?? "";
    form.attr_2_values = item.value.attr_2_values ?? "";
    form.attr_2_visible = item.value.attr_2_visible ?? false;
    form.attr_2_global = item.value.attr_2_global ?? false;
    form.attr_2_default = item.value.attr_2_default ?? "";
    form.attr_3_name = item.value.attr_3_name ?? "";
    form.attr_3_values = item.value.attr_3_values ?? "";
    form.attr_3_visible = item.value.attr_3_visible ?? false;
    form.attr_3_global = item.value.attr_3_global ?? false;
    form.attr_3_default = item.value.attr_3_default ?? "";
    form.download_1_name = item.value.download_1_name ?? "";
    form.download_1_url = item.value.download_1_url ?? "";
    form.download_2_name = item.value.download_2_name ?? "";
    form.download_2_url = item.value.download_2_url ?? "";
    form.rank_math_title = item.value.rank_math_title ?? "";
    form.rank_math_description = item.value.rank_math_description ?? "";
    form.rank_math_facebook_title = item.value.rank_math_facebook_title ?? "";
    form.rank_math_facebook_description = item.value.rank_math_facebook_description ?? "";
    form.rank_math_facebook_image = item.value.rank_math_facebook_image ?? "";
    form.rank_math_twitter_title = item.value.rank_math_twitter_title ?? "";
    form.rank_math_twitter_description = item.value.rank_math_twitter_description ?? "";
    form.rank_math_twitter_image = item.value.rank_math_twitter_image ?? "";
    form.rank_math_focus_keyword = item.value.rank_math_focus_keyword ?? "";
    form.rank_math_canonical_url = item.value.rank_math_canonical_url ?? "";

    const matchedCategory = categoryOptions.find((option) =>
      form.categories.toLowerCase().includes(option.toLowerCase())
    );
    selectedCategory.value = matchedCategory ?? "";
    if (form.attr_3_name === "Attachments" && form.attr_3_values) {
      selectedAttachments.value = parseList(form.attr_3_values);
    }

  } catch (error) {
    const err = error as Error;
    errorMessage.value = err.message || "Failed to load item.";
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (!item.value) {
    return;
  }

  saving.value = true;
  saveError.value = "";
  saveMessage.value = "";

  try {
    await ensureFolderExists(form.folder);
    item.value = await updateItem(item.value.id, {
      title: form.title,
      excerpt: form.excerpt,
      content_md: form.content_md,
      status: form.status,
      featured: form.featured,
      folder: form.folder,
      post_id: form.post_id,
      post_password: form.post_password,
      menu_order: form.menu_order,
      post_date: form.post_date,
      post_author: form.post_author,
      comment_status: form.comment_status,
      sku: form.sku,
      gtin: form.gtin,
      parent_sku: form.parent_sku,
      children: form.children,
      downloadable: form.downloadable,
      virtual: form.virtual,
      stock: "",
      regular_price: form.regular_price,
      sale_price: form.sale_price,
      weight: form.weight,
      length: form.length,
      width: form.width,
      height: form.height,
      tax_class: form.tax_class,
      stock_status: "instock",
      backorders: "no",
      sold_individually: false,
      low_stock_amount: "",
      manage_stock: false,
      tax_status: form.tax_status,
      upsell_ids: form.upsell_ids,
      crosssell_ids: form.crosssell_ids,
      purchase_note: form.purchase_note,
      sale_price_dates_from: form.sale_price_dates_from,
      sale_price_dates_to: form.sale_price_dates_to,
      download_limit: form.download_limit,
      download_expiry: form.download_expiry,
      product_url: form.product_url,
      button_text: form.button_text,
      product_type: form.product_type,
      categories: form.categories,
      tags: form.tags,
      images: joinImagesForWoo(productImages.value.length ? productImages.value : form.images),
      short_description: form.short_description,
      shipping_class: form.shipping_class,
      visibility: form.visibility,
      attr_1_name: form.attr_1_name,
      attr_1_values: form.attr_1_values,
      attr_1_visible: form.attr_1_visible,
      attr_1_global: form.attr_1_global,
      attr_1_default: form.attr_1_default,
      attr_2_name: form.attr_2_name,
      attr_2_values: form.attr_2_values,
      attr_2_visible: form.attr_2_visible,
      attr_2_global: form.attr_2_global,
      attr_2_default: form.attr_2_default,
      attr_3_name: form.attr_3_name,
      attr_3_values: form.attr_3_values,
      attr_3_visible: form.attr_3_visible,
      attr_3_global: form.attr_3_global,
      attr_3_default: form.attr_3_default,
      download_1_name: form.download_1_name,
      download_1_url: form.download_1_url,
      download_2_name: form.download_2_name,
      download_2_url: form.download_2_url,
      rank_math_title: form.rank_math_title,
      rank_math_description: form.rank_math_description,
      rank_math_facebook_title: form.rank_math_facebook_title,
      rank_math_facebook_description: form.rank_math_facebook_description,
      rank_math_facebook_image: form.rank_math_facebook_image,
      rank_math_twitter_title: form.rank_math_twitter_title,
      rank_math_twitter_description: form.rank_math_twitter_description,
      rank_math_twitter_image: form.rank_math_twitter_image,
      rank_math_focus_keyword: form.rank_math_focus_keyword,
      rank_math_canonical_url: form.rank_math_canonical_url
    });

    saveMessage.value = "Changes saved.";
  } catch (error) {
    const err = error as Error;
    saveError.value = err.message || "Failed to save item.";
  } finally {
    saving.value = false;
  }
};

watch(
  () => user.value?.id || devOwnerId.value,
  () => {
    loadFolderOptions();
  },
  { immediate: true }
);

onMounted(() => {
  loadItem();
});
</script>
