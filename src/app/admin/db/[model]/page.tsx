import Link from "next/link";
import { headers } from "next/headers";

async function fetchRecords(model: string, q = "") {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = `${base}/api/admin/model/${model}/records?q=${encodeURIComponent(q)}`;
  const requestHeaders = await headers();
  const res = await fetch(url, {
    cache: "no-store",
    headers: { cookie: requestHeaders.get("cookie") || "" },
  });
  if (!res.ok) throw new Error("Failed to load records");
  return res.json();
}

export default async function ModelPage({ params, searchParams }: { params: Promise<{ model: string }>, searchParams?: Promise<{ q?: string }> }) {
  const { model } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = resolvedSearchParams.q || "";
  const data = await fetchRecords(model, q as string);

  return (
    <div style={{ padding: 24 }}>
      <h1>Model: {model}</h1>
      <p>Records: {data.records.length}</p>
      <ul>
        {data.records.map((r: any) => (
          <li key={r.id}>
            <Link href={`/admin/db/${model}/${r.id}`}>{r.id}</Link>
            {r.userId ? (<span> — user: <Link href={`/admin/users/${r.userId}`}>{r.userId}</Link></span>) : null}
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(r, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
