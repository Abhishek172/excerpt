export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          EXCERPT
        </h1>

        <p className="text-lg text-neutral-300 mb-6">
          Search conversations like evidence.
        </p>

        <p className="text-sm text-neutral-400 mb-10">
          Upload chats or transcripts.  
          Ask questions in plain English.  
          Retrieve exact messages — not summaries.
          <br />
          <span className="block mt-2">
            Data auto-deletes after 24 hours.
          </span>
        </p>

        <a
          href="/upload"
          className="inline-block rounded-md bg-neutral-100 text-neutral-900 px-6 py-3 text-sm font-medium hover:bg-white transition"
        >
          Upload a conversation
        </a>

        <p className="mt-8 text-xs text-neutral-500">
          No signup required • Pay per upload • Privacy-first
        </p>
      </div>
    </main>
  );
}
