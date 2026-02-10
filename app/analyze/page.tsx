import { supabaseAdmin } from "@/lib/supabase";
import SearchClient from "./SearchClient";
import PaywallClient from "./PaywallClient";

export const metadata = {
  title: "Search Conversation · Excerpt",
};


type AnalyzePageProps = {
  searchParams: Promise<{
    uploadId?: string;
  }>;
};

export default async function AnalyzePage({
  searchParams,
}: AnalyzePageProps) {
  const { uploadId } = await searchParams;

  if (!uploadId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">
        Missing upload ID.
      </div>
    );
  }

  const { data: upload, error: uploadError } =
    await supabaseAdmin
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .single();

  if (uploadError) {
    console.error("UPLOAD FETCH ERROR:", uploadError);
  }

  if (!upload) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-red-400">
        Upload not found or inaccessible.
      </div>
    );
  }

  const { data: previewMessages, error: msgError } =
    await supabaseAdmin
      .from("messages")
      .select("id, sender, timestamp, text")
      .eq("upload_id", uploadId)
      .order("timestamp", { ascending: true })
      .limit(8);

  if (msgError) {
    console.error("MESSAGE FETCH ERROR:", msgError);
  }

  return (
    <main className="min-h-screen flex justify-center px-6 py-12 bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-semibold mb-2">
          Conversation Search
        </h1>

        <p className="text-sm text-neutral-400 mb-6">
          Retrieve exact messages from your conversation.
        </p>

        <SearchClient uploadId={uploadId} paid={upload.paid} />

        {!upload.paid && (
          <PaywallClient uploadId={uploadId} />
        )}

        {previewMessages && (
          <div className="mt-8 space-y-4 opacity-80">
            <p className="text-xs text-neutral-500">
              Preview messages
            </p>

            {previewMessages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-md border border-neutral-800 bg-neutral-900 p-4 text-sm"
              >
                <div className="mb-1 text-xs text-neutral-400">
                  {msg.sender}
                  {msg.timestamp
                    ? ` • ${new Date(
                        msg.timestamp
                      ).toLocaleString()}`
                    : ""}
                </div>
                <div className="whitespace-pre-wrap">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
