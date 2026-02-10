export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-sm text-neutral-300">
      <h1 className="text-2xl font-semibold mb-4">Privacy</h1>

      <p className="mb-4">
        Excerpt processes uploaded conversations only to provide search
        and retrieval functionality.
      </p>

      <p className="mb-4">
        We do not use WhatsApp APIs. We do not sell, share, or reuse your data.
      </p>

      <p className="mb-4">
        Uploaded files and derived data are automatically deleted within
        24 hours.
      </p>

      <p>
        We do not use uploaded data for training any models.
      </p>
    </main>
  );
}
