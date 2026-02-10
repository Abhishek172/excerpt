"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpload() {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.uploadId) {
      router.push(`/analyze?uploadId=${data.uploadId}`);
    } else {
      alert("Upload failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex justify-center px-6 py-16 bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-semibold mb-2">
          Upload a conversation
        </h1>

        <p className="text-sm text-neutral-400 mb-6">
          Upload a Transcript or WhatsApp chat export (.txt). Your data is
          automatically deleted after 24 hours.
        </p>

        <label className="block w-full cursor-pointer rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-800 mb-4">
          {file ? file.name : "Choose a .txt file"}
          <input
            type="file"
            accept=".txt"
            className="hidden"
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200 disabled:opacity-50"
        >
          {loading ? "Processing…" : "Upload conversation"}
        </button>
      </div>
    </main>
  );
}
