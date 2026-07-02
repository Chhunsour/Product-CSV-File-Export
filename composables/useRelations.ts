import type { WorkspaceItem } from "~/types/db";

export const useRelations = () => {
  const supabase = useSupabaseClient();

  const listRelatedItems = async (itemId: string): Promise<WorkspaceItem[]> => {
    const { data: relations, error } = await supabase
      .from("item_relations")
      .select("to_item_id")
      .eq("from_item_id", itemId)
      .eq("relation_type", "related");

    if (error) {
      throw error;
    }

    const ids = (relations ?? []).map((row) => row.to_item_id);
    if (!ids.length) {
      return [];
    }

    const { data: items, error: itemsError } = await supabase
      .from("workspace_items")
      .select("*")
      .in("id", ids)
      .order("updated_at", { ascending: false });

    if (itemsError) {
      throw itemsError;
    }

    return items ?? [];
  };

  return {
    listRelatedItems
  };
};
