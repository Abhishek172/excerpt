import SearchClient from "./SearchClient";
import { getSupabaseAdmin } from "@/lib/supabase";

interface Props {
  searchParams: Promise<{ uploadId?: string }>;
}

export default async function AnalyzePage({ searchParams }: Props) {
  const { uploadId } = await searchParams;

  if (!uploadId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Invalid access. Please upload a conversation first.
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
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Upload not found.
      </div>
    );
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender, text, timestamp")
    .eq("upload_id", uploadId)
    .order("timestamp", { ascending: true });

  return (
    <SearchClient
      uploadId={upload.id}
      paid={upload.paid}
      messages={messages || []}
    />
  );
}
