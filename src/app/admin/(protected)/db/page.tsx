import Link from "next/link";
import { headers } from "next/headers";

async function fetchModels() {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const requestHeaders = await headers();
  const res = await fetch(`${base}/api/admin/models`, {
    cache: "no-store",
    headers: { cookie: requestHeaders.get("cookie") || "" },
  });
  if (!res.ok) throw new Error("Failed to load models");
  return res.json();
}

export default async function DBPage() {
  const data = await fetchModels();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">DB Explorer</h1>
        <p className="text-zinc-500 text-sm mt-1">Browse database models and their records.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {data.models.map((m: string) => (
          <Link
            key={m}
            href={`/admin/db/${m.toLowerCase()}`}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-white text-sm font-medium hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
          >
            {m}
          </Link>
        ))}
      </div>
    </div>
  );
}
