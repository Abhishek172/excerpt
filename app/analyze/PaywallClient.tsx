"use client";

export default function PaywallClient({
  uploadId,
}: {
  uploadId: string;
}) {
  async function handlePay() {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId }),
    });

    const data = await res.json();
    window.location.href = data.url;
  }

  return (
    <div className="mt-6 rounded-md border border-neutral-800 bg-neutral-900 p-4 text-sm">
      <p className="text-neutral-300 mb-2">
        🔒 Full search is locked
      </p>

      <p className="text-neutral-400 mb-4">
        Unlock unlimited searches, sender filters, and date filters.
      </p>

      <button
        onClick={handlePay}
        className="rounded-md bg-neutral-100 text-neutral-900 px-4 py-2 text-sm font-medium hover:bg-white"
      >
        Unlock full search for $9
      </button>
    </div>
  );
}
