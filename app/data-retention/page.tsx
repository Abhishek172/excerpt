export default function DataRetentionPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-sm text-neutral-300">
      <h1 className="text-2xl font-semibold mb-4">Data Retention</h1>

      <p className="mb-4">
        All uploaded conversations and processed messages are stored
        temporarily.
      </p>

      <p className="mb-4">
        Data is automatically deleted within 24 hours of upload.
      </p>

      <p className="mb-4">
        Once deleted, data cannot be recovered.
      </p>

      <p>
        This policy applies to all users, free and paid.
      </p>
    </main>
  );
}
