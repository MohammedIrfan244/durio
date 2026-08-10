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
    <div style={{ padding: 24 }}>
      <h1>DB Explorer</h1>
      <ul>
        {data.models.map((m: string) => (
          <li key={m}><Link href={`/admin/db/${m.toLowerCase()}`}>{m}</Link></li>
        ))}
      </ul>
    </div>
  );
}
