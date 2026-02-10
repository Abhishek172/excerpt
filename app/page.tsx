export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Search your WhatsApp chats or Transcripts like a database
        </h1>

        <p className="mt-4 text-lg text-neutral-400">
          Upload a chat. Search by emotion or keyword.  
          Nothing stored. Automatically deleted in 24 hours.
        </p>

        <div className="mt-8">
          <a
            href="/upload"
            className="inline-block rounded-md bg-white px-6 py-3 text-sm font-medium text-black"
          >
            Upload a chat
          </a>
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          No login required · Privacy-first · One-time payment
        </p>
      </div>
    </main>
  );
}
