import Link from "next/link";
import { headers } from "next/headers";
import type { AdminRecordsResponse } from "@/types/admin";

async function fetchRecords(model: string, q = ""): Promise<AdminRecordsResponse> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = `${base}/api/admin/model/${model}/records?q=${encodeURIComponent(q)}`;
  const requestHeaders = await headers();
  const res = await fetch(url, {
    cache: "no-store",
    headers: { cookie: requestHeaders.get("cookie") || "" },
  });
  if (!res.ok) throw new Error("Failed to load records");
  return res.json() as Promise<AdminRecordsResponse>;
}

export default async function ModelPage({ params, searchParams }: { params: Promise<{ model: string }>; searchParams?: Promise<{ q?: string }> }) {
  const { model } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = resolvedSearchParams.q || "";
  const data = await fetchRecords(model, q as string);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/db" className="text-sm text-zinc-500 hover:text-white">
          ← Back to Models
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Model: {model}</h1>
        <p className="text-zinc-500 text-sm mt-1">{data.records.length} records</p>
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          name="q"
          type="text"
          placeholder="Search by ID, email, or name..."
          defaultValue={q}
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
        />
        <button
          type="submit"
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Search
        </button>
      </form>

      {/* Records */}
      <div className="space-y-4">
        {data.records.map((r) => (
          <div key={r.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/admin/db/${model}/${r.id}`} className="text-white font-medium text-sm hover:underline">
                {r.id}
              </Link>
              {r.userId && (
                <span className="text-zinc-500 text-xs">
                  — user:{" "}
                  <Link href={`/admin/users/${r.userId}`} className="text-zinc-400 hover:underline">
                    {r.userId}
                  </Link>
                </span>
              )}
            </div>
            <pre className="text-xs text-zinc-400 whitespace-pre-wrap bg-zinc-950 rounded p-3 overflow-auto max-h-60">
              {JSON.stringify(r, null, 2)}
            </pre>
          </div>
        ))}
        {data.records.length === 0 && (
          <p className="text-zinc-500 text-sm">No records found.</p>
        )}
      </div>
    </div>
  );
}
