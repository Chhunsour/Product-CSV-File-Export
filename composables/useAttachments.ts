import type { Attachment } from "~/types/db";
import { safeFileName } from "~/utils/files";

export const useAttachments = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const requireUser = () => {
    if (!user.value) {
      throw new Error("Not authenticated");
    }
    return user.value;
  };

  const listForItem = async (itemId: string): Promise<Attachment[]> => {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("item_id", itemId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  };

  const addLink = async (itemId: string, label: string, url: string) => {
    const currentUser = requireUser();
    const { data, error } = await supabase
      .from("attachments")
      .insert({
        owner_id: currentUser.id,
        item_id: itemId,
        type: "link",
        label: label || null,
        url
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as Attachment;
  };

  const uploadFile = async (itemId: string, file: File, label?: string) => {
    const currentUser = requireUser();
    const fileName = safeFileName(file.name);
    const path = `${currentUser.id}/${itemId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("workspace")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data, error } = await supabase
      .from("attachments")
      .insert({
        owner_id: currentUser.id,
        item_id: itemId,
        type: "file",
        label: label || file.name,
        url: path
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as Attachment;
  };

  const removeAttachment = async (attachment: Attachment) => {
    if (attachment.type === "file") {
      const { count, error: countError } = await supabase
        .from("attachments")
        .select("id", { count: "exact", head: true })
        .eq("url", attachment.url);

      if (countError) {
        throw countError;
      }

      if ((count ?? 0) <= 1) {
        const { error: storageError } = await supabase.storage
          .from("workspace")
          .remove([attachment.url]);

        if (storageError) {
          throw storageError;
        }
      }
    }

    const { error } = await supabase
      .from("attachments")
      .delete()
      .eq("id", attachment.id);

    if (error) {
      throw error;
    }
  };

  const getSignedUrl = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("workspace")
      .createSignedUrl(path, 60 * 10);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  };

  return {
    listForItem,
    addLink,
    uploadFile,
    removeAttachment,
    getSignedUrl
  };
};
