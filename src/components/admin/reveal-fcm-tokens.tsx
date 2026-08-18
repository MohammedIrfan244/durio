"use client";

import { useState } from "react";

export default function RevealFcmTokens({ userId }: { userId: string }) {
  const [passphrase, setPassphrase] = useState("");
  const [tokens, setTokens] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleReveal() {
    setError(null);
    setLoading(true);
    setTokens(null);
    try {
      const res = await fetch("/api/admin/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, field: "fcmTokens", passphrase }),
        cache: "no-store",
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Failed to reveal FCM tokens");
      }
      setTokens(body.fcmTokens || []);
    } catch (err) {
      console.error(err);
      setError("Failed to reveal FCM tokens");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-zinc-500 text-xs uppercase tracking-wider">Reveal FCM Tokens</p>
      <div className="mt-3 flex flex-col gap-2">
        <input
          type="password"
          placeholder="Admin secret passphrase"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
        />
        <button
          type="button"
          onClick={handleReveal}
          disabled={loading || !passphrase}
          className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? "Revealing..." : "Show FCM Tokens"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {tokens && (
          <pre className="mt-2 overflow-x-auto rounded bg-zinc-900 p-3 text-xs text-zinc-200">
            {tokens.length > 0 ? JSON.stringify(tokens, null, 2) : "No FCM tokens found."}
          </pre>
        )}
      </div>
    </div>
  );
}
