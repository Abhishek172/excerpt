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

export default function SearchClient({ uploadId, paid, messages }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function runSearch() {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, query }),
      });

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function unlock() {
    setRedirecting(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId }),
    });

    const data = await res.json();
    window.location.href = data.url;
  }

  const previewMessages = messages.slice(0, 5);

  // Decide what messages to show
  const visibleMessages = paid
    ? query && hasSearched
      ? results
      : messages
    : previewMessages;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">

        {/* 🔓 PAID SUCCESS */}
        {paid && (
          <div className="mb-6 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            ✅ Full search unlocked.
            <div className="text-xs text-green-300 mt-1">
              ⏳ This conversation will auto-delete in 24 hours.
            </div>
          </div>
        )}

        {/* 🔒 PREVIEW MODE */}
        {!paid && (
          <div className="mb-6 rounded-md border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-300">
            🔒 <strong>Preview mode</strong>
            <p className="mt-1 text-neutral-400">
              Uploading is free. Unlock full emotional & keyword search for{" "}
              <strong>$9 (one-time)</strong>.
            </p>

            <button
              onClick={unlock}
              disabled={redirecting}
              className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {redirecting ? "Redirecting…" : "Unlock full search"}
            </button>
          </div>
        )}

        {/* SEARCH INPUT */}
        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
            placeholder={
              paid
                ? "Search messages…"
                : "Unlock full search to query messages"
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHasSearched(false); // 🔑 reset search state on typing
            }}
            disabled={!paid}
          />
          <button
            onClick={runSearch}
            disabled={!paid || loading}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {/* RESULTS / CONVERSATION */}
        <div className="space-y-4">
          {visibleMessages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-md border border-neutral-800 bg-neutral-900 p-3"
            >
              <div className="text-xs text-neutral-400 mb-1">
                {msg.sender} ·{" "}
                {new Date(msg.timestamp)
                  .toISOString()
                  .replace("T", " ")
                  .slice(0, 16)}
              </div>
              <div className="text-sm text-neutral-200">{msg.text}</div>
            </div>
          ))}

          {!paid && (
            <div className="text-sm text-neutral-500 italic">
              Showing preview messages. Unlock to view and search the full conversation.
            </div>
          )}

          {/* ✅ ONLY show after an actual search */}
          {paid && hasSearched && !loading && results.length === 0 && (
            <div className="text-sm text-neutral-500">
              No messages matched your search.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
