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
    } catch (err: any) {
      setError(err.message || "Failed to explore user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={runExplore} disabled={loading} style={{ padding: "8px 12px" }}>
        {loading ? "Exploring..." : "Explore user data"}
      </button>

      {error ? <p style={{ color: "red" }}>{error}</p> : null}

      {data ? (
        <div style={{ marginTop: 12 }}>
          <h3>Explore Results</h3>
          <pre style={{ whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto" }}>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
