"use client";

import { useState } from "react";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface Props {
  uploadId: string;
  paid: boolean;
  messages: Message[];
}

// Deterministic formatter (no locale differences)
function formatTimestamp(ts: string) {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default function SearchClient({
  uploadId,
  paid,
  messages,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  async function handleSearch() {
    if (!query) return;

    if (!paid) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, query }),
    });

    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  }

  async function handleUnlock() {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  }

  const listToShow = results ?? messages;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">
          Search conversation
        </h1>

        {!paid && (
          <div className="mb-4 rounded-md border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            🔒 Search is locked. Upload is free — unlock full search for $9.
          </div>
        )}

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages…"
          className="w-full mb-3 px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800"
        />

        <button
          onClick={handleSearch}
          className="mb-6 rounded-md bg-white px-4 py-2 text-black"
        >
          {loading ? "Searching…" : "Search"}
        </button>

        {showPaywall && !paid && (
          <div className="mb-6 rounded-md border border-neutral-800 bg-neutral-900 p-6 text-center">
            <p className="mb-4 text-sm text-neutral-300">
              Unlock full search to filter messages by keyword,
              emotion, or sender.
            </p>

            <button
              onClick={handleUnlock}
              className="rounded-md bg-white px-6 py-2 text-sm font-medium text-black"
            >
              🔓 Unlock full search — $9
            </button>
          </div>
        )}

        <div className="space-y-4">
          {listToShow.map((msg) => (
            <div
              key={msg.id}
              className="rounded-md border border-neutral-800 bg-neutral-900 p-3"
            >
              <div className="text-xs text-neutral-400 mb-1">
                {msg.sender} · {formatTimestamp(msg.timestamp)}
              </div>
              <div>{msg.text}</div>
            </div>
          ))}

          {results && results.length === 0 && (
            <div className="text-sm text-neutral-400">
              No messages matched your query.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
