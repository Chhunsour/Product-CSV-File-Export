<template>
  <Teleport to="body">
    <div v-if="open" class="todo-backdrop" @click="closePanel"></div>
    <div class="todo-float" :style="{ bottom: `${floatOffset}px` }">
      <div class="todo-float-launch">
        <span class="todo-float-label">Task Beacon</span>
        <button
          type="button"
          class="todo-float-button"
          :aria-expanded="open"
          @click="toggleOpen"
        >
          <span class="todo-float-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l2 2 4-4"></path>
              <circle cx="12" cy="12" r="9"></circle>
            </svg>
          </span>
          <span v-if="openCount" class="todo-float-count">{{ openCount }}</span>
          <span class="todo-float-ring" aria-hidden="true"></span>
        </button>
      </div>

      <transition name="todo-float-panel">
        <div
          v-if="open"
          class="todo-panel"
          :class="!compact && 'todo-panel-expanded'"
          :style="panelStyle"
          role="dialog"
          aria-label="Todo list"
          @click.stop
        >
          <div class="todo-panel-head">
            <div class="todo-head-left">
              <p class="todo-kicker">REMINDER</p>
              <h3 class="todo-title">Task Beacon</h3>
            </div>
            <div class="todo-head-right">
              <button type="button" class="todo-head-btn" @click="compact = !compact">
                {{ compact ? "Expand" : "Compact" }}
              </button>
              <button type="button" class="todo-head-btn" @click="closePanel">Close</button>
            </div>
          </div>

          <div class="todo-progress">
            <div class="todo-progress-bar">
              <span :style="{ width: `${progressPercent}%` }"></span>
            </div>
            <div class="todo-progress-meta">
              <span>{{ doneCount }} done</span>
              <strong>{{ progressPercent }}%</strong>
              <span>{{ totalCount }} total</span>
            </div>
          </div>

          <div class="todo-layout">
            <aside class="todo-sidebar">
              <div class="todo-card">
                <div class="todo-card-head">
                  <span class="todo-card-title">Overview</span>
                  <span class="todo-card-metric">{{ totalCount }}</span>
                </div>
                <div class="todo-summary">
                  <button
                    type="button"
                    :class="['todo-summary-card', viewFilter === 'all' && 'active']"
                    @click="viewFilter = 'all'"
                  >
                    <span class="todo-summary-label">All</span>
                    <strong class="todo-summary-value">{{ totalCount }}</strong>
                  </button>
                  <button
                    type="button"
                    :class="['todo-summary-card', viewFilter === 'active' && 'active']"
                    @click="viewFilter = 'active'"
                  >
                    <span class="todo-summary-label">Active</span>
                    <strong class="todo-summary-value">{{ openCount }}</strong>
                  </button>
                  <button
                    type="button"
                    :class="['todo-summary-card', viewFilter === 'done' && 'active']"
                    @click="viewFilter = 'done'"
                  >
                    <span class="todo-summary-label">Done</span>
                    <strong class="todo-summary-value">{{ doneCount }}</strong>
                  </button>
                  <button
                    type="button"
                    :class="['todo-summary-card', viewFilter === 'starred' && 'active']"
                    @click="viewFilter = 'starred'"
                  >
                    <span class="todo-summary-label">Starred</span>
                    <strong class="todo-summary-value">{{ starredCount }}</strong>
                  </button>
                </div>
              </div>

              <div class="todo-card">
                <div class="todo-card-head">
                  <span class="todo-card-title">Lists</span>
                  <span class="todo-card-metric">{{ listFilter }}</span>
                </div>
                <div class="todo-lists">
                  <button
                    v-for="list in listOptions"
                    :key="list"
                    type="button"
                    :class="['todo-list-chip', listFilter === list && 'todo-list-chip-active']"
                    @click="listFilter = list"
                  >
                    <span v-if="list !== 'All'" class="todo-list-dot"></span>
                    {{ list }}
                  </button>
                </div>
              </div>

              <div class="todo-card">
                <div class="todo-card-head">
                  <span class="todo-card-title">Views</span>
                  <span class="todo-card-metric">{{ viewLabel }}</span>
                </div>
                <div class="todo-view">
                  <button
                    v-for="view in viewOptions"
                    :key="view.value"
                    type="button"
                    :class="['todo-view-pill', viewFilter === view.value && 'todo-view-pill-active']"
                    @click="viewFilter = view.value"
                  >
                    {{ view.label }}
                  </button>
                </div>
              </div>

              <div class="todo-card">
                <div class="todo-card-head">
                  <span class="todo-card-title">Archive</span>
                  <span class="todo-card-metric">{{ archivedCount }}</span>
                </div>
                <div class="todo-archive-actions">
                  <button type="button" class="todo-action-btn" @click="archiveDone">
                    Archive done
                  </button>
                  <button type="button" class="todo-action-btn" @click="downloadReport">
                    Report
                  </button>
                </div>
              </div>
            </aside>

            <main class="todo-main">
              <div class="todo-toolbar">
                <div class="todo-search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="7"></circle>
                    <path d="M20 20l-3.5-3.5"></path>
                  </svg>
                  <input v-model="searchTerm" type="text" placeholder="Search tasks" />
                  <button v-if="searchTerm" type="button" class="todo-search-clear" @click="searchTerm = ''">
                    Clear
                  </button>
                </div>
                <select v-model="sortBy" class="todo-select">
                  <option value="recent">Sort: Recent</option>
                  <option value="due">Sort: Due date</option>
                  <option value="title">Sort: Title</option>
                </select>
              </div>

              <div class="todo-form">
                <div class="todo-section-head">
                  <div>
                    <span class="todo-section-kicker">Quick add</span>
                    <span class="todo-section-title">Create a task fast</span>
                  </div>
                </div>
                <div class="todo-input-row">
                  <input
                    v-model="newTodoText"
                    type="text"
                    class="todo-input"
                    placeholder="Add a task..."
                    @keydown.enter.prevent="addTodo"
                  />
                  <button type="button" class="todo-add" @click="addTodo">
                    Add
                  </button>
                </div>
                <div class="todo-form-grid">
                  <label>
                    <span class="todo-section-kicker">Task by</span>
                    <select v-model="newTodoOwner" class="todo-select">
                      <option v-for="owner in ownerOptions" :key="owner" :value="owner">
                        {{ owner }}
                      </option>
                    </select>
                  </label>
                  <label>
                    <span class="todo-section-kicker">List</span>
                    <select v-model="newTodoList" class="todo-select">
                      <option v-for="list in listOptions" :key="list" :value="list">
                        {{ list }}
                      </option>
                    </select>
                  </label>
                  <label>
                    <span class="todo-section-kicker">Due date</span>
                    <input v-model="newTodoDue" type="date" class="todo-input" />
                  </label>
                </div>
                <div class="todo-quick">
                  <button type="button" class="todo-quick-btn" @click="setDueToday">Today</button>
                  <button type="button" class="todo-quick-btn" @click="setDueTomorrow">Tomorrow</button>
                  <button type="button" class="todo-quick-btn" @click="setDueNextWeek">Next week</button>
                </div>
              </div>

              <div class="todo-list" :style="{ gridTemplateColumns: listGridColumns }">
                <div v-if="!visibleTodos.length" class="todo-empty">No tasks yet.</div>
                <article v-else v-for="todo in visibleTodos" :key="todo.id" class="todo-row">
                  <button
                    type="button"
                    :class="['todo-check', todo.done && 'todo-check-active']"
                    @click="toggleTodo(todo.id)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </button>

                  <div class="todo-row-main">
                    <div class="todo-row-top">
                      <span :class="['todo-priority', ownerClass(todo.owner)]">{{ todo.owner || 'Me' }}</span>
                      <span
                        v-if="todo.due"
                        :class="['todo-due', isOverdue(todo) && !todo.done && 'overdue']"
                      >
                        Due {{ formatDate(todo.due) }}
                      </span>
                      <p :class="['todo-item-text', todo.done && 'todo-item-done']">{{ todo.text }}</p>
                      <button
                        type="button"
                        :class="['todo-star', todo.starred && 'active']"
                        @click="toggleStar(todo.id)"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 3l3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.3-6.3 3.3 1.2-7-5-4.9 7-1z" />
                        </svg>
                      </button>
                    </div>
                    <div class="todo-item-meta">
                      <span>List: {{ todo.list || 'Work' }}</span>
                      <span v-if="todo.archived">Archived {{ formatDate(todo.archivedAt || todo.createdAt) }}</span>
                      <span>Created {{ formatDate(todo.createdAt) }}</span>
                    </div>

                    <div v-if="editingId === todo.id" class="todo-edit">
                      <input v-model="editText" type="text" class="todo-input" />
                      <div class="todo-form-grid">
                        <select v-model="editOwner" class="todo-select">
                          <option v-for="owner in ownerOptions" :key="owner" :value="owner">
                            {{ owner }}
                          </option>
                        </select>
                        <select v-model="editList" class="todo-select">
                          <option v-for="list in listOptions" :key="list" :value="list">
                            {{ list }}
                          </option>
                        </select>
                        <input v-model="editDue" type="date" class="todo-input" />
                      </div>
                      <div class="todo-archive-actions">
                        <button type="button" class="todo-action-btn" @click="saveEdit(todo.id)">
                          Save
                        </button>
                        <button type="button" class="todo-action-btn danger" @click="cancelEdit">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="todo-row-actions">
                    <button type="button" class="todo-action-btn" @click="startEdit(todo)">Edit</button>
                    <button type="button" class="todo-action-btn" @click="copyTodo(todo)">Copy</button>
                    <button type="button" class="todo-action-btn danger" @click="removeTodo(todo.id)">Del</button>
                  </div>
                </article>
              </div>

              <div v-if="archivedTodos.length" class="todo-archive-panel">
                <div class="todo-archive-head">
                  <div>
                    <span class="todo-section-kicker">Archive</span>
                    <span class="todo-section-title">Completed & stored tasks</span>
                  </div>
                  <div class="todo-archive-actions">
                    <button type="button" class="todo-action-btn" @click="restoreAllArchived">
                      Restore
                    </button>
                    <button type="button" class="todo-action-btn danger" @click="clearArchive">
                      Clear archive
                    </button>
                  </div>
                </div>
                <div class="todo-list todo-list-archive">
                  <article v-for="todo in archivedTodos" :key="todo.id" class="todo-row todo-archive-row">
                    <div class="todo-row-main">
                      <div class="todo-row-top">
                        <span :class="['todo-priority', ownerClass(todo.owner)]">{{ todo.owner || 'Me' }}</span>
                        <span v-if="todo.due" class="todo-due">Due {{ formatDate(todo.due) }}</span>
                        <p class="todo-item-text">{{ todo.text }}</p>
                      </div>
                      <div class="todo-item-meta">
                        <span>Archived {{ formatDate(todo.archivedAt || todo.createdAt) }}</span>
                      </div>
                    </div>
                    <div class="todo-row-actions">
                      <button type="button" class="todo-action-btn" @click="restoreTodo(todo.id)">Restore</button>
                      <button type="button" class="todo-action-btn danger" @click="removeTodo(todo.id)">Delete</button>
                    </div>
                  </article>
                </div>
              </div>
            </main>
          </div>

          <div class="todo-foot">
            <button type="button" class="todo-foot-btn" :disabled="!openCount" @click="markAllDone">
              Complete all
            </button>
            <button type="button" class="todo-foot-btn" :disabled="!doneCount" @click="archiveDone">
              Archive done
            </button>
            <button type="button" class="todo-foot-btn" @click="downloadReport">
              Report
            </button>
            <button type="button" class="todo-foot-btn danger" :disabled="!totalCount" @click="clearAll">
              Clear all
            </button>
          </div>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from "vue";

type TodoItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  due?: string;
  owner?: string;
  list?: string;
  starred?: boolean;
  archived?: boolean;
  archivedAt?: string;
};

const STORAGE_KEY = "todoVault";
const route = useRoute();
const user = useSupabaseUser();
const runtimeConfig = useRuntimeConfig();
const devOwnerId = computed(() => runtimeConfig.public.devOwnerId || "");

const open = ref(false);
const compact = ref(false);
const todos = ref<TodoItem[]>([]);
const newTodoText = ref("");
const newTodoDue = ref("");
const newTodoOwner = ref("Me");
const newTodoList = ref("Work");
const listFilter = ref("Work");
const viewFilter = ref<"all" | "active" | "done" | "today" | "upcoming" | "overdue" | "starred">("all");
const searchTerm = ref("");
const sortBy = ref<"recent" | "due" | "title">("recent");
const editingId = ref<string | null>(null);
const editText = ref("");
const editDue = ref("");
const editOwner = ref("Me");
const editList = ref("Work");
const hydrating = ref(true);
const syncError = ref("");
let syncTimer: ReturnType<typeof setTimeout> | null = null;

const listOptions = ["All", "Work", "Personal", "Urgent", "School"];
const ownerOptions = ["Me", "Somalika", "Chhay", "Kim", "Dennis"];
const viewOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
  { value: "today", label: "Today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "overdue", label: "Overdue" },
  { value: "starred", label: "Starred" }
] as const;

const floatOffset = computed(() =>
  route.path.startsWith("/admin/new") || route.path.startsWith("/admin/edit") ? 96 : 24
);

const panelStyle = computed(() => ({
  width: compact.value ? "min(48vw, 760px)" : "min(72vw, 1200px)"
}));

const listGridColumns = computed(() =>
  compact.value ? "repeat(auto-fit, minmax(280px, 1fr))" : "repeat(auto-fit, minmax(300px, 1fr))"
);

const totalCount = computed(() => todos.value.length);
const doneCount = computed(() => todos.value.filter((item) => item.done || item.archived).length);
const openCount = computed(() => todos.value.filter((item) => !item.done && !item.archived).length);
const starredCount = computed(() => todos.value.filter((item) => item.starred).length);
const archivedCount = computed(() => todos.value.filter((item) => item.archived).length);
const progressPercent = computed(() => {
  if (!totalCount.value) return 0;
  return Math.round((doneCount.value / totalCount.value) * 100);
});

const viewLabel = computed(() => {
  const match = viewOptions.find((option) => option.value === viewFilter.value);
  return match ? match.label : "All";
});

const todayISO = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

const ownerClass = (owner?: string) => {
  if (!owner) return "";
  return owner.toLowerCase();
};

const toDate = (value?: string) => {
  if (!value) return null;
  return new Date(`${value}T00:00:00`);
};

const isOverdue = (todo: TodoItem) => {
  if (!todo.due) return false;
  const dueDate = toDate(todo.due);
  if (!dueDate) return false;
  const today = toDate(todayISO());
  if (!today) return false;
  return dueDate.getTime() < today.getTime();
};

const normalizeTodo = (item: TodoItem): TodoItem => ({
  ...item,
  owner: item.owner || "Me",
  list: item.list || "Work",
  done: Boolean(item.done),
  archived: Boolean(item.archived),
  starred: Boolean(item.starred)
});

const filteredTodos = computed(() => {
  let list = todos.value.map(normalizeTodo);

  if (listFilter.value !== "All") {
    list = list.filter((todo) => (todo.list || "Work") === listFilter.value);
  }

  if (searchTerm.value.trim()) {
    const term = searchTerm.value.trim().toLowerCase();
    list = list.filter((todo) => {
      return (
        todo.text.toLowerCase().includes(term) ||
        (todo.owner ?? "").toLowerCase().includes(term) ||
        (todo.list ?? "").toLowerCase().includes(term)
      );
    });
  }

  switch (viewFilter.value) {
    case "active":
      list = list.filter((todo) => !todo.done && !todo.archived);
      break;
    case "done":
      list = list.filter((todo) => todo.done || todo.archived);
      break;
    case "today":
      list = list.filter((todo) => todo.due === todayISO());
      break;
    case "upcoming":
      list = list.filter((todo) => {
        if (!todo.due) return false;
        const dueDate = toDate(todo.due);
        const today = toDate(todayISO());
        return Boolean(dueDate && today && dueDate.getTime() > today.getTime());
      });
      break;
    case "overdue":
      list = list.filter((todo) => isOverdue(todo) && !todo.done && !todo.archived);
      break;
    case "starred":
      list = list.filter((todo) => todo.starred);
      break;
    default:
      break;
  }

  switch (sortBy.value) {
    case "due":
      return list.sort((a, b) => {
        const aDate = toDate(a.due)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bDate = toDate(b.due)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      });
    case "title":
      return list.sort((a, b) => a.text.localeCompare(b.text));
    default:
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
});

const archivedTodos = computed(() =>
  todos.value.filter((todo) => todo.archived).map(normalizeTodo)
);

const visibleTodos = computed(() => filteredTodos.value.filter((todo) => !todo.archived));

const toggleOpen = () => {
  open.value = !open.value;
  if (open.value && !newTodoDue.value) {
    newTodoDue.value = todayISO();
  }
};

const closePanel = () => {
  open.value = false;
  editingId.value = null;
};

const makeId = () => `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const addTodo = () => {
  const text = newTodoText.value.trim();
  if (!text) return;
  const item: TodoItem = {
    id: makeId(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
    due: newTodoDue.value || todayISO(),
    owner: newTodoOwner.value,
    list: newTodoList.value,
    starred: false,
    archived: false
  };
  todos.value = [item, ...todos.value];
  newTodoText.value = "";
  newTodoDue.value = todayISO();
};

const toggleTodo = (id: string) => {
  const item = todos.value.find((entry) => entry.id === id);
  if (!item) return;
  item.done = !item.done;
  if (!item.done) {
    item.archived = false;
    item.archivedAt = undefined;
  }
};

const toggleStar = (id: string) => {
  const item = todos.value.find((entry) => entry.id === id);
  if (!item) return;
  item.starred = !item.starred;
};

const removeTodo = (id: string) => {
  todos.value = todos.value.filter((entry) => entry.id !== id);
};

const markAllDone = () => {
  todos.value = todos.value.map((entry) => ({ ...entry, done: true }));
};

const archiveDone = () => {
  todos.value = todos.value.map((entry) => {
    if (entry.done) {
      return { ...entry, archived: true, archivedAt: entry.archivedAt ?? new Date().toISOString() };
    }
    return entry;
  });
};

const clearAll = () => {
  if (!todos.value.length) return;
  if (!window.confirm("Clear all tasks?")) return;
  todos.value = [];
};

const restoreTodo = (id: string) => {
  const item = todos.value.find((entry) => entry.id === id);
  if (!item) return;
  item.archived = false;
  item.done = false;
  item.archivedAt = undefined;
};

const restoreAllArchived = () => {
  todos.value = todos.value.map((entry) => {
    if (!entry.archived) return entry;
    return { ...entry, archived: false, done: false, archivedAt: undefined };
  });
};

const clearArchive = () => {
  todos.value = todos.value.filter((entry) => !entry.archived);
};

const startEdit = (todo: TodoItem) => {
  editingId.value = todo.id;
  editText.value = todo.text;
  editOwner.value = todo.owner || "Me";
  editList.value = todo.list || "Work";
  editDue.value = todo.due || todayISO();
};

const saveEdit = (id: string) => {
  const item = todos.value.find((entry) => entry.id === id);
  if (!item) return;
  item.text = editText.value.trim() || item.text;
  item.owner = editOwner.value;
  item.list = editList.value;
  item.due = editDue.value || item.due;
  editingId.value = null;
};

const cancelEdit = () => {
  editingId.value = null;
};

const copyTodo = async (todo: TodoItem) => {
  const lines = [
    `Task: ${todo.text}`,
    `Owner: ${todo.owner || "Me"}`,
    `List: ${todo.list || "Work"}`,
    todo.due ? `Due: ${formatDate(todo.due)}` : "",
    todo.done ? "Status: Done" : "Status: Active"
  ].filter(Boolean);
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
  } catch {
    // ignore
  }
};

const downloadReport = () => {
  const report = todos.value.map(normalizeTodo);
  const header = "Task,Owner,List,Due,Status,Created,Archived";
  const rows = report.map((item) => {
    const status = item.archived ? "Archived" : item.done ? "Done" : "Active";
    return [
      item.text,
      item.owner || "",
      item.list || "",
      item.due || "",
      status,
      item.createdAt,
      item.archivedAt || ""
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",");
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `task-beacon-${todayISO()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const setDueToday = () => {
  newTodoDue.value = todayISO();
};

const setDueTomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  newTodoDue.value = date.toISOString().slice(0, 10);
};

const setDueNextWeek = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  newTodoDue.value = date.toISOString().slice(0, 10);
};

const loadState = () => {
  if (!process.client) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as TodoItem[];
    if (Array.isArray(parsed)) {
      todos.value = parsed.map(normalizeTodo);
    }
  } catch {
    // ignore
  }
};

const loadRemote = async () => {
  if (!process.client) return;
  const effectiveId = user.value?.id || devOwnerId.value;
  if (!effectiveId) {
    loadState();
    hydrating.value = false;
    return;
  }
  try {
    const response = await $fetch<{ items?: TodoItem[] }>("/api/task-beacon/list", {
      query: { ownerId: effectiveId }
    });
    const remoteItems = Array.isArray(response?.items) ? response.items : [];
    if (remoteItems.length) {
      todos.value = remoteItems.map(normalizeTodo);
      saveState();
    } else {
      loadState();
    }
    syncError.value = "";
  } catch (error: any) {
    syncError.value = error?.message || "Sync failed.";
    loadState();
  } finally {
    hydrating.value = false;
  }
};

const saveRemote = async () => {
  if (!process.client) return;
  const effectiveId = user.value?.id || devOwnerId.value;
  if (!effectiveId) return;
  try {
    await $fetch("/api/task-beacon/save", {
      method: "POST",
      body: { ownerId: effectiveId, items: todos.value }
    });
    syncError.value = "";
  } catch (error: any) {
    syncError.value = error?.message || "Sync failed.";
  }
};

const saveState = () => {
  if (!process.client) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos.value));
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && open.value) {
    closePanel();
  }
};

onMounted(() => {
  loadRemote();
  if (!newTodoDue.value) {
    newTodoDue.value = todayISO();
  }
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (syncTimer) {
    clearTimeout(syncTimer);
  }
});

watch(
  todos,
  () => {
    saveState();
    if (hydrating.value) return;
    const effectiveId = user.value?.id || devOwnerId.value;
    if (!effectiveId) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      saveRemote();
    }, 600);
  },
  { deep: true }
);

watch(
  () => user.value?.id,
  () => {
    hydrating.value = true;
    loadRemote();
  }
);

watch(
  () => devOwnerId.value,
  () => {
    if (user.value?.id) return;
    hydrating.value = true;
    loadRemote();
  }
);

watch(listFilter, (value) => {
  if (value !== "All") {
    newTodoList.value = value;
  }
});
</script>
