"use client";

import { useState } from "react";

export default function UserExplorer({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runExplore() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/explore`, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Status ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (er) {
      console.error(er);
      setError( "Failed to explore user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={runExplore}
        disabled={loading}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Exploring..." : "Explore user data"}
      </button>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {data && (
        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="text-sm font-bold text-white mb-2">Explore Results</h3>
          <pre className="text-xs text-zinc-400 whitespace-pre-wrap overflow-auto max-h-96 bg-zinc-950 rounded p-3">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
