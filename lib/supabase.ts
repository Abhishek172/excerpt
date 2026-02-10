import { createClient } from "@supabase/supabase-js";

let _adminClient: any = null;

export function getSupabaseAdmin() {
  if (_adminClient) return _adminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)"
    );
  }

  _adminClient = createClient(supabaseUrl, serviceRoleKey);
  return _adminClient as any;
}
