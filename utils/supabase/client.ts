import type { SupabaseClient } from "@supabase/supabase-js";

export const useSupabaseBrowser = (): SupabaseClient => {
  return useSupabaseClient();
};
