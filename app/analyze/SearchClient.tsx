"use client";

import { useState } from "react";

type Message = {
  id: string;
  sender: string;
  timestamp: string | null;
  text: string;
};

export default function SearchClient({
  uploadId,
  paid,
}: {
  uploadId: string;
  paid: boolean;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!paid) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, query }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={runSearch} className="mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            paid
              ? "e.g. messages where Alex apologized"
              : "Unlock to search this conversation"
          }
          disabled={!paid}
          className={`w-full rounded-md px-4 py-3 text-sm border ${
            paid
              ? "bg-neutral-900 border-neutral-800 text-neutral-100"
              : "bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed"
          }`}
        />

        <button
          disabled={!paid || loading}
          className="mt-3 rounded-md bg-neutral-100 text-neutral-900 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-40"
        >
          {paid
            ? loading
              ? "Searching…"
              : "Search"
            : "Search locked"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-400 mb-4">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((msg) => (
            <div
              key={msg.id}
              className="rounded-md border border-neutral-800 bg-neutral-900 p-4 text-sm"
            >
              <div className="mb-1 text-xs text-neutral-400">
                {msg.sender}
                {msg.timestamp
                  ? ` • ${new Date(msg.timestamp).toLocaleString()}`
                  : ""}
              </div>
              <div className="whitespace-pre-wrap">
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      )}

      {!paid && (
        <p className="text-xs text-neutral-500">
          Upload is free. Search unlocks after payment.
        </p>
      )}

      {paid && hasSearched && results.length === 0 && !loading && (
        <p className="text-sm text-neutral-400">
          No messages matched your search.
        </p>
      )}
    </div>
  );
}
