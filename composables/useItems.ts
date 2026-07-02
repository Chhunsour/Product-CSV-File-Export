import { slugify } from "~/utils/slug";
import type { WorkspaceItem, ItemStatus } from "~/types/db";

export const useItems = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const runtimeConfig = useRuntimeConfig();
  const devOwnerId = computed(() => runtimeConfig.public.devOwnerId || "");

  const textOrNull = (value: string | null | undefined) => {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  };

  const requireUser = () => {
    if (user.value) {
      return user.value;
    }
    if (devOwnerId.value) {
      return { id: devOwnerId.value } as any;
    }
    throw new Error("Not authenticated");
  };

  const listItems = async (query?: string): Promise<WorkspaceItem[]> => {
    try {
      const queryPayload: Record<string, string> = {};
      if (query?.trim()) {
        queryPayload.q = query.trim();
      }
      const effectiveId = user.value?.id || devOwnerId.value;
      if (effectiveId) {
        queryPayload.ownerId = effectiveId;
      }
      const response = await $fetch<{ items?: WorkspaceItem[] }>("/api/workspace-items/list", {
        query: queryPayload
      });
      if (response?.items) {
        return response.items;
      }
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status ?? error?.response?.status;
      if (status && status !== 404) {
        throw error;
      }
    }

    let request = supabase
      .from("workspace_items")
      .select("*")
      .order("updated_at", { ascending: false });

    if (query && query.trim().length) {
      const term = query.trim();
      const pattern = `%${term}%`;
      request = request.or(
        [
          `title.ilike.${pattern}`,
          `post_id.ilike.${pattern}`,
          `sku.ilike.${pattern}`,
          `slug.ilike.${pattern}`,
          `excerpt.ilike.${pattern}`,
          `short_description.ilike.${pattern}`,
          `regular_price.ilike.${pattern}`,
          `sale_price.ilike.${pattern}`,
          `categories.ilike.${pattern}`,
          `tags.ilike.${pattern}`,
          `product_type.ilike.${pattern}`
        ].join(",")
      );
    }

    const { data, error } = await request;
    if (error) {
      throw error;
    }
    return data ?? [];
  };

  const getItemBySlug = async (slug: string): Promise<WorkspaceItem> => {
    const { data, error } = await supabase
      .from("workspace_items")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      throw error;
    }
    return data as WorkspaceItem;
  };

  const getItemById = async (id: string): Promise<WorkspaceItem> => {
    try {
      const effectiveId = user.value?.id || devOwnerId.value;
      const response = await $fetch<{ item?: WorkspaceItem | null }>(
        "/api/workspace-items/get",
        {
          query: { id, ownerId: effectiveId }
        }
      );
      if (response?.item) {
        return response.item;
      }
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status ?? error?.response?.status;
      if (status && status !== 404) {
        throw error;
      }
    }

    const { data, error } = await supabase
      .from("workspace_items")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error("Item not found");
    }
    return data as WorkspaceItem;
  };

  const ensureUniqueSlug = async (
    baseSlug: string,
    excludeId?: string
  ): Promise<string> => {
    const currentUser = requireUser();
    let candidate = baseSlug;
    let counter = 2;

    while (true) {
      let request = supabase
        .from("workspace_items")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", currentUser.id)
        .eq("slug", candidate);

      if (excludeId) {
        request = request.neq("id", excludeId);
      }

      const { count, error } = await request;
      if (error) {
        throw error;
      }

      if ((count ?? 0) === 0) {
        return candidate;
      }

      candidate = `${baseSlug}-${counter}`;
      counter += 1;
    }
  };

  const createItem = async (payload: {
    title: string;
    excerpt: string;
    content_md: string;
    status: ItemStatus;
    featured: boolean;
    folder?: string;
    parent_id?: string | null;
    post_id?: string;
    post_password?: string;
    menu_order?: string;
    post_date?: string;
    post_author?: string;
    comment_status?: string;
    sku?: string;
    gtin?: string;
    parent_sku?: string;
    children?: string;
    downloadable?: boolean;
    virtual?: boolean;
    stock?: string;
    regular_price?: string;
    sale_price?: string;
    weight?: string;
    length?: string;
    width?: string;
    height?: string;
    tax_class?: string;
    stock_status?: string;
    backorders?: string;
    sold_individually?: boolean;
    low_stock_amount?: string;
    manage_stock?: boolean;
    tax_status?: string;
    upsell_ids?: string;
    crosssell_ids?: string;
    purchase_note?: string;
    sale_price_dates_from?: string;
    sale_price_dates_to?: string;
    download_limit?: string;
    download_expiry?: string;
    product_url?: string;
    button_text?: string;
    product_type?: string;
    categories?: string;
    tags?: string;
    images?: string;
    short_description?: string;
    shipping_class?: string;
    visibility?: string;
    attr_1_name?: string;
    attr_1_values?: string;
    attr_1_visible?: boolean;
    attr_1_global?: boolean;
    attr_1_default?: string;
    attr_2_name?: string;
    attr_2_values?: string;
    attr_2_visible?: boolean;
    attr_2_global?: boolean;
    attr_2_default?: string;
    attr_3_name?: string;
    attr_3_values?: string;
    attr_3_visible?: boolean;
    attr_3_global?: boolean;
    attr_3_default?: string;
    download_1_name?: string;
    download_1_url?: string;
    download_2_name?: string;
    download_2_url?: string;
    rank_math_title?: string;
    rank_math_description?: string;
    rank_math_facebook_title?: string;
    rank_math_facebook_description?: string;
    rank_math_facebook_image?: string;
    rank_math_twitter_title?: string;
    rank_math_twitter_description?: string;
    rank_math_twitter_image?: string;
    rank_math_focus_keyword?: string;
    rank_math_canonical_url?: string;
  }): Promise<WorkspaceItem> => {
    try {
      const response = await $fetch<{ item?: WorkspaceItem }>("/api/workspace-items/create", {
        method: "POST",
        body: { ownerId: user.value?.id || devOwnerId.value, ...payload }
      });
      if (response?.item) {
        return response.item;
      }
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status ?? error?.response?.status;
      if (status && status !== 404) {
        throw error;
      }
    }

    const currentUser = requireUser();
    const baseSlug = slugify(payload.title);
    const slug = await ensureUniqueSlug(baseSlug);

    const { data, error } = await supabase
      .from("workspace_items")
      .insert({
        owner_id: currentUser.id,
        title: payload.title,
        slug,
        excerpt: textOrNull(payload.excerpt),
        content_md: textOrNull(payload.content_md),
        status: payload.status,
        featured: payload.featured,
        folder: textOrNull(payload.folder) ?? "production",
        parent_id: payload.parent_id ?? null,
        post_id: textOrNull(payload.post_id),
        post_password: textOrNull(payload.post_password),
        menu_order: textOrNull(payload.menu_order),
        post_date: textOrNull(payload.post_date),
        post_author: textOrNull(payload.post_author),
        comment_status: textOrNull(payload.comment_status),
        sku: textOrNull(payload.sku),
        gtin: textOrNull(payload.gtin),
        parent_sku: textOrNull(payload.parent_sku),
        children: textOrNull(payload.children),
        downloadable: payload.downloadable ?? false,
        virtual: payload.virtual ?? false,
        stock: textOrNull(payload.stock),
        regular_price: textOrNull(payload.regular_price),
        sale_price: textOrNull(payload.sale_price),
        weight: textOrNull(payload.weight),
        length: textOrNull(payload.length),
        width: textOrNull(payload.width),
        height: textOrNull(payload.height),
        tax_class: textOrNull(payload.tax_class),
        stock_status: textOrNull(payload.stock_status),
        backorders: textOrNull(payload.backorders),
        sold_individually: payload.sold_individually ?? false,
        low_stock_amount: textOrNull(payload.low_stock_amount),
        manage_stock: payload.manage_stock ?? false,
        tax_status: textOrNull(payload.tax_status),
        upsell_ids: textOrNull(payload.upsell_ids),
        crosssell_ids: textOrNull(payload.crosssell_ids),
        purchase_note: textOrNull(payload.purchase_note),
        sale_price_dates_from: textOrNull(payload.sale_price_dates_from),
        sale_price_dates_to: textOrNull(payload.sale_price_dates_to),
        download_limit: textOrNull(payload.download_limit),
        download_expiry: textOrNull(payload.download_expiry),
        product_url: textOrNull(payload.product_url),
        button_text: textOrNull(payload.button_text),
        product_type: textOrNull(payload.product_type),
        categories: textOrNull(payload.categories),
        tags: textOrNull(payload.tags),
        images: textOrNull(payload.images),
        short_description: textOrNull(payload.short_description),
        shipping_class: textOrNull(payload.shipping_class),
        visibility: textOrNull(payload.visibility),
        attr_1_name: textOrNull(payload.attr_1_name),
        attr_1_values: textOrNull(payload.attr_1_values),
        attr_1_visible: payload.attr_1_visible ?? false,
        attr_1_global: payload.attr_1_global ?? false,
        attr_1_default: textOrNull(payload.attr_1_default),
        attr_2_name: textOrNull(payload.attr_2_name),
        attr_2_values: textOrNull(payload.attr_2_values),
        attr_2_visible: payload.attr_2_visible ?? false,
        attr_2_global: payload.attr_2_global ?? false,
        attr_2_default: textOrNull(payload.attr_2_default),
        attr_3_name: textOrNull(payload.attr_3_name),
        attr_3_values: textOrNull(payload.attr_3_values),
        attr_3_visible: payload.attr_3_visible ?? false,
        attr_3_global: payload.attr_3_global ?? false,
        attr_3_default: textOrNull(payload.attr_3_default),
        download_1_name: textOrNull(payload.download_1_name),
        download_1_url: textOrNull(payload.download_1_url),
        download_2_name: textOrNull(payload.download_2_name),
        download_2_url: textOrNull(payload.download_2_url),
        rank_math_title: textOrNull(payload.rank_math_title),
        rank_math_description: textOrNull(payload.rank_math_description),
        rank_math_facebook_title: textOrNull(payload.rank_math_facebook_title),
        rank_math_facebook_description: textOrNull(payload.rank_math_facebook_description),
        rank_math_facebook_image: textOrNull(payload.rank_math_facebook_image),
        rank_math_twitter_title: textOrNull(payload.rank_math_twitter_title),
        rank_math_twitter_description: textOrNull(payload.rank_math_twitter_description),
        rank_math_twitter_image: textOrNull(payload.rank_math_twitter_image),
        rank_math_focus_keyword: textOrNull(payload.rank_math_focus_keyword),
        rank_math_canonical_url: textOrNull(payload.rank_math_canonical_url)
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as WorkspaceItem;
  };

  const updateItem = async (
    id: string,
    payload: {
      title: string;
      excerpt: string;
      content_md: string;
      status: ItemStatus;
      featured: boolean;
      folder?: string;
      parent_id?: string | null;
      post_id?: string;
      post_password?: string;
      menu_order?: string;
      post_date?: string;
      post_author?: string;
      comment_status?: string;
      sku?: string;
      gtin?: string;
      parent_sku?: string;
      children?: string;
      downloadable?: boolean;
      virtual?: boolean;
      stock?: string;
      regular_price?: string;
      sale_price?: string;
      weight?: string;
      length?: string;
      width?: string;
      height?: string;
      tax_class?: string;
      stock_status?: string;
      backorders?: string;
      sold_individually?: boolean;
      low_stock_amount?: string;
      manage_stock?: boolean;
      tax_status?: string;
      upsell_ids?: string;
      crosssell_ids?: string;
      purchase_note?: string;
      sale_price_dates_from?: string;
      sale_price_dates_to?: string;
      download_limit?: string;
      download_expiry?: string;
      product_url?: string;
      button_text?: string;
      product_type?: string;
      categories?: string;
      tags?: string;
      images?: string;
      short_description?: string;
      shipping_class?: string;
      visibility?: string;
      attr_1_name?: string;
      attr_1_values?: string;
      attr_1_visible?: boolean;
      attr_1_global?: boolean;
      attr_1_default?: string;
      attr_2_name?: string;
      attr_2_values?: string;
      attr_2_visible?: boolean;
      attr_2_global?: boolean;
      attr_2_default?: string;
      attr_3_name?: string;
      attr_3_values?: string;
      attr_3_visible?: boolean;
      attr_3_global?: boolean;
      attr_3_default?: string;
      download_1_name?: string;
      download_1_url?: string;
      download_2_name?: string;
      download_2_url?: string;
      rank_math_title?: string;
      rank_math_description?: string;
      rank_math_facebook_title?: string;
      rank_math_facebook_description?: string;
      rank_math_facebook_image?: string;
      rank_math_twitter_title?: string;
      rank_math_twitter_description?: string;
      rank_math_twitter_image?: string;
      rank_math_focus_keyword?: string;
      rank_math_canonical_url?: string;
    }
  ): Promise<WorkspaceItem> => {
    try {
      const response = await $fetch<{ item?: WorkspaceItem }>("/api/workspace-items/update", {
        method: "POST",
        body: { ownerId: user.value?.id || devOwnerId.value, id, ...payload }
      });
      if (response?.item) {
        return response.item;
      }
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status ?? error?.response?.status;
      if (status && status !== 404) {
        throw error;
      }
    }

    const currentUser = requireUser();
    const baseSlug = slugify(payload.title);
    const slug = await ensureUniqueSlug(baseSlug, id);

    const { data, error } = await supabase
      .from("workspace_items")
      .update({
        title: payload.title,
        slug,
        excerpt: textOrNull(payload.excerpt),
        content_md: textOrNull(payload.content_md),
        status: payload.status,
        featured: payload.featured,
        folder: textOrNull(payload.folder) ?? "production",
        parent_id: payload.parent_id ?? null,
        post_id: textOrNull(payload.post_id),
        post_password: textOrNull(payload.post_password),
        menu_order: textOrNull(payload.menu_order),
        post_date: textOrNull(payload.post_date),
        post_author: textOrNull(payload.post_author),
        comment_status: textOrNull(payload.comment_status),
        sku: textOrNull(payload.sku),
        gtin: textOrNull(payload.gtin),
        parent_sku: textOrNull(payload.parent_sku),
        children: textOrNull(payload.children),
        downloadable: payload.downloadable ?? false,
        virtual: payload.virtual ?? false,
        stock: textOrNull(payload.stock),
        regular_price: textOrNull(payload.regular_price),
        sale_price: textOrNull(payload.sale_price),
        weight: textOrNull(payload.weight),
        length: textOrNull(payload.length),
        width: textOrNull(payload.width),
        height: textOrNull(payload.height),
        tax_class: textOrNull(payload.tax_class),
        stock_status: textOrNull(payload.stock_status),
        backorders: textOrNull(payload.backorders),
        sold_individually: payload.sold_individually ?? false,
        low_stock_amount: textOrNull(payload.low_stock_amount),
        manage_stock: payload.manage_stock ?? false,
        tax_status: textOrNull(payload.tax_status),
        upsell_ids: textOrNull(payload.upsell_ids),
        crosssell_ids: textOrNull(payload.crosssell_ids),
        purchase_note: textOrNull(payload.purchase_note),
        sale_price_dates_from: textOrNull(payload.sale_price_dates_from),
        sale_price_dates_to: textOrNull(payload.sale_price_dates_to),
        download_limit: textOrNull(payload.download_limit),
        download_expiry: textOrNull(payload.download_expiry),
        product_url: textOrNull(payload.product_url),
        button_text: textOrNull(payload.button_text),
        product_type: textOrNull(payload.product_type),
        categories: textOrNull(payload.categories),
        tags: textOrNull(payload.tags),
        images: textOrNull(payload.images),
        short_description: textOrNull(payload.short_description),
        shipping_class: textOrNull(payload.shipping_class),
        visibility: textOrNull(payload.visibility),
        attr_1_name: textOrNull(payload.attr_1_name),
        attr_1_values: textOrNull(payload.attr_1_values),
        attr_1_visible: payload.attr_1_visible ?? false,
        attr_1_global: payload.attr_1_global ?? false,
        attr_1_default: textOrNull(payload.attr_1_default),
        attr_2_name: textOrNull(payload.attr_2_name),
        attr_2_values: textOrNull(payload.attr_2_values),
        attr_2_visible: payload.attr_2_visible ?? false,
        attr_2_global: payload.attr_2_global ?? false,
        attr_2_default: textOrNull(payload.attr_2_default),
        attr_3_name: textOrNull(payload.attr_3_name),
        attr_3_values: textOrNull(payload.attr_3_values),
        attr_3_visible: payload.attr_3_visible ?? false,
        attr_3_global: payload.attr_3_global ?? false,
        attr_3_default: textOrNull(payload.attr_3_default),
        download_1_name: textOrNull(payload.download_1_name),
        download_1_url: textOrNull(payload.download_1_url),
        download_2_name: textOrNull(payload.download_2_name),
        download_2_url: textOrNull(payload.download_2_url),
        rank_math_title: textOrNull(payload.rank_math_title),
        rank_math_description: textOrNull(payload.rank_math_description),
        rank_math_facebook_title: textOrNull(payload.rank_math_facebook_title),
        rank_math_facebook_description: textOrNull(payload.rank_math_facebook_description),
        rank_math_facebook_image: textOrNull(payload.rank_math_facebook_image),
        rank_math_twitter_title: textOrNull(payload.rank_math_twitter_title),
        rank_math_twitter_description: textOrNull(payload.rank_math_twitter_description),
        rank_math_twitter_image: textOrNull(payload.rank_math_twitter_image),
        rank_math_focus_keyword: textOrNull(payload.rank_math_focus_keyword),
        rank_math_canonical_url: textOrNull(payload.rank_math_canonical_url)
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as WorkspaceItem;
  };

  const deleteItem = async (id: string) => {
    try {
      await $fetch("/api/workspace-items/delete", {
        method: "POST",
        body: { ownerId: user.value?.id || devOwnerId.value, id }
      });
      return;
    } catch (error: any) {
      const status = error?.statusCode ?? error?.status ?? error?.response?.status;
      if (status && status !== 404) {
        throw error;
      }
    }
    const currentUser = requireUser();
    const { error } = await supabase
      .from("workspace_items")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  };

  return {
    listItems,
    getItemBySlug,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    ensureUniqueSlug
  };
};
