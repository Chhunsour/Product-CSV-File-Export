import type { SupabaseClient } from "@supabase/supabase-js";
import { serverSupabaseClient, serverSupabaseServiceRole } from "#supabase/server";

export const getSupabaseServerClient = async (event: any): Promise<SupabaseClient> => {
  return await serverSupabaseClient(event);
};

export const getSupabaseAdminClient = (event: any): SupabaseClient => {
  return serverSupabaseServiceRole(event);
};
