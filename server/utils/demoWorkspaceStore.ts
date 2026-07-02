import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { slugify } from "~/utils/slug";

type DemoItem = Record<string, any> & {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  folder?: string | null;
  created_at: string;
  updated_at: string;
};

type DemoFolder = {
  id: string;
  owner_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type DemoStore = {
  items: DemoItem[];
  folders: DemoFolder[];
};

const storePath = join(process.cwd(), ".data", "demo-workspace.json");

const searchableFields = [
  "title",
  "post_id",
  "sku",
  "slug",
  "excerpt",
  "short_description",
  "regular_price",
  "sale_price",
  "categories",
  "tags",
  "product_type"
];

const falseByDefault = [
  "featured",
  "downloadable",
  "virtual",
  "sold_individually",
  "manage_stock",
  "attr_1_visible",
  "attr_1_global",
  "attr_2_visible",
  "attr_2_global",
  "attr_3_visible",
  "attr_3_global"
];

const readStore = async (): Promise<DemoStore> => {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<DemoStore>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      folders: Array.isArray(parsed.folders) ? parsed.folders : []
    };
  } catch (error: any) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
    return { items: [], folders: [] };
  }
};

const writeStore = async (store: DemoStore) => {
  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
};

let storeQueue: Promise<unknown> = Promise.resolve();

const withStore = async <T>(callback: (store: DemoStore) => T | Promise<T>): Promise<T> => {
  const next = storeQueue.then(async () => {
    const store = await readStore();
    const result = await callback(store);
    await writeStore(store);
    return result;
  });
  storeQueue = next.catch(() => undefined);
  return next;
};

const readCurrentStore = async () => {
  await storeQueue.catch(() => undefined);
  return readStore();
};

const textOrNull = (value: unknown) => {
  if (typeof value !== "string") return value ?? null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const ensureOwnerFolder = (store: DemoStore, ownerId: string) => {
  if (store.folders.some((folder) => folder.owner_id === ownerId)) return;
  const now = new Date().toISOString();
  store.folders.push({
    id: randomUUID(),
    owner_id: ownerId,
    name: "production",
    is_active: true,
    created_at: now,
    updated_at: now
  });
};

const ensureFolderByName = (store: DemoStore, ownerId: string, name: string, setActive = false) => {
  const now = new Date().toISOString();
  if (setActive) {
    store.folders
      .filter((folder) => folder.owner_id === ownerId)
      .forEach((folder) => {
        folder.is_active = false;
        folder.updated_at = now;
      });
  }

  let folder = store.folders.find((item) => item.owner_id === ownerId && item.name === name);
  if (!folder) {
    folder = {
      id: randomUUID(),
      owner_id: ownerId,
      name,
      is_active: setActive,
      created_at: now,
      updated_at: now
    };
    store.folders.push(folder);
  } else if (setActive) {
    folder.is_active = true;
    folder.updated_at = now;
  }

  return folder;
};

const uniqueSlug = (store: DemoStore, ownerId: string, title: string, excludeId?: string) => {
  const baseSlug = slugify(title) || "item";
  let candidate = baseSlug;
  let counter = 2;

  while (
    store.items.some(
      (item) => item.owner_id === ownerId && item.slug === candidate && item.id !== excludeId
    )
  ) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
};

const buildItem = (
  ownerId: string,
  body: Record<string, any>,
  slug: string,
  existing?: DemoItem
): DemoItem => {
  const now = new Date().toISOString();
  const item: DemoItem = {
    ...(existing ?? {}),
    id: existing?.id ?? randomUUID(),
    owner_id: ownerId,
    title: body.title.trim(),
    slug,
    status: body.status || existing?.status || "draft",
    folder: textOrNull(body.folder) ?? existing?.folder ?? "production",
    created_at: existing?.created_at ?? now,
    updated_at: now
  };

  Object.entries(body).forEach(([key, value]) => {
    if (key === "id" || key === "ownerId" || key === "owner_id") return;
    if (value === undefined) return;
    item[key] = textOrNull(value);
  });

  falseByDefault.forEach((key) => {
    if (item[key] === undefined || item[key] === null) {
      item[key] = false;
    }
  });

  return item;
};

export const listDemoItems = async (ownerId: string, query = "") => {
  const term = query.trim().toLowerCase();
  return withStore((store) => {
    ensureOwnerFolder(store, ownerId);
    return store.items
      .filter((item) => item.owner_id === ownerId)
      .filter((item) => {
        if (!term) return true;
        return searchableFields.some((field) =>
          String(item[field] ?? "")
            .toLowerCase()
            .includes(term)
        );
      })
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
  });
};

export const getDemoItem = async (ownerId: string, id: string) => {
  const store = await readCurrentStore();
  return store.items.find((item) => item.owner_id === ownerId && item.id === id) ?? null;
};

export const createDemoItem = async (ownerId: string, body: Record<string, any>) => {
  return withStore((store) => {
    ensureOwnerFolder(store, ownerId);
    const title = body.title.trim();
    const item = buildItem(ownerId, body, uniqueSlug(store, ownerId, title));
    ensureFolderByName(store, ownerId, item.folder || "production");
    store.items.push(item);
    return item;
  });
};

export const updateDemoItem = async (ownerId: string, body: Record<string, any>) => {
  return withStore((store) => {
    const index = store.items.findIndex((item) => item.owner_id === ownerId && item.id === body.id);
    if (index < 0) return null;

    const title = body.title.trim();
    const item = buildItem(ownerId, body, uniqueSlug(store, ownerId, title, body.id), store.items[index]);
    ensureFolderByName(store, ownerId, item.folder || "production");
    store.items[index] = item;
    return item;
  });
};

export const deleteDemoItems = async (ownerId: string, ids: string[]) => {
  await withStore((store) => {
    store.items = store.items.filter((item) => item.owner_id !== ownerId || !ids.includes(item.id));
  });
};

export const listDemoFolders = async (ownerId: string) => {
  return withStore((store) => {
    ensureOwnerFolder(store, ownerId);
    return store.folders
      .filter((folder) => folder.owner_id === ownerId)
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  });
};

export const ensureDemoFolder = async (ownerId: string, name: string, setActive = false) => {
  await withStore((store) => {
    ensureOwnerFolder(store, ownerId);
    ensureFolderByName(store, ownerId, name, setActive);
  });
};

export const renameDemoFolder = async (ownerId: string, name: string, next: string) => {
  await withStore((store) => {
    const now = new Date().toISOString();
    const folder = store.folders.find((item) => item.owner_id === ownerId && item.name === name);
    if (folder) {
      folder.name = next;
      folder.updated_at = now;
    } else {
      ensureFolderByName(store, ownerId, next);
    }

    store.items
      .filter((item) => item.owner_id === ownerId && item.folder === name)
      .forEach((item) => {
        item.folder = next;
        item.updated_at = now;
      });
  });
};

export const deleteDemoFolder = async (ownerId: string, name: string, fallback: string) => {
  await withStore((store) => {
    const now = new Date().toISOString();
    store.items
      .filter((item) => item.owner_id === ownerId && item.folder === name)
      .forEach((item) => {
        item.folder = fallback;
        item.updated_at = now;
      });
    store.folders = store.folders.filter(
      (folder) => folder.owner_id !== ownerId || folder.name !== name
    );
    const folders = store.folders.filter((folder) => folder.owner_id === ownerId);
    if (folders.length && !folders.some((folder) => folder.is_active)) {
      folders[0].is_active = true;
      folders[0].updated_at = now;
    }
  });
};
