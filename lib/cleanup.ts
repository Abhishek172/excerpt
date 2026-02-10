import { supabaseAdmin } from "@/lib/supabase";

export async function cleanupExpiredUploads() {
  const { error } = await supabaseAdmin
    .from("uploads")
    .delete()
    .lt("expires_at", new Date().toISOString());

  if (error) {
    console.error("TTL cleanup failed:", error);
  }
}
