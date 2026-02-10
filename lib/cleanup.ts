import { getSupabaseAdmin } from "@/lib/supabase";

const supabaseAdmin = getSupabaseAdmin();


export async function cleanupExpiredUploads() {
  const supabaseAdmin = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from("uploads")
    .delete()
    .lt("expires_at", now);

  if (error) {
    console.error("Cleanup failed:", error);
  }
}
