import { getSupabaseAdmin } from "@/lib/supabase";
import SearchClient from "./SearchClient";

interface AnalyzePageProps {
  searchParams: Promise<{ uploadId?: string }>;
}

export default async function AnalyzePage({
  searchParams,
}: AnalyzePageProps) {
  const { uploadId } = await searchParams;

  if (!uploadId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="text-sm text-neutral-400">
          Invalid access. Please upload a conversation first.
        </div>
      </div>
    );
  }

  const supabase = getSupabaseAdmin();

  const { data: upload } = await supabase
    .from("uploads")
    .select("id, paid")
    .eq("id", uploadId)
    .single();

  if (!upload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="text-sm text-neutral-400">
          Upload not found or expired.
        </div>
      </div>
    );
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("upload_id", uploadId)
    .order("timestamp", { ascending: true });

  return (
    <SearchClient
      uploadId={upload.id}
      paid={Boolean(upload.paid)}
      messages={messages || []}
    />
  );
}
