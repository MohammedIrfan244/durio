import { notFound } from "next/navigation";
import { headers } from "next/headers";

async function fetchRecord(model: string, id: string) {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = `${base}/api/admin/model/${model}/records?id=${encodeURIComponent(id)}`;
  const requestHeaders = await headers();
  const res = await fetch(url, {
    cache: "no-store",
    headers: { cookie: requestHeaders.get("cookie") || "" },
  });
  if (!res.ok) throw new Error("Failed to load record");
  return res.json();
}

export default async function RecordPage({ params }: { params: Promise<{ model: string; id: string }> }) {
  const { model, id } = await params;
  let data: any;
  try {
    data = await fetchRecord(model, id);
  } catch (e) {
    return notFound();
  }

  const record = data.records && data.records[0];
  if (!record) return notFound();

  return (
    <div style={{ padding: 24 }}>
      <h1>{model} — {id}</h1>
      <pre>{JSON.stringify(record, null, 2)}</pre>
      {record.userId ? <p>Owner: <a href={`/admin/users/${record.userId}`}>{record.userId}</a></p> : null}
    </div>
  );
}
