import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";

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
    <div className="space-y-6">
      <div>
        <Link href={`/admin/db/${model}`} className="text-sm text-zinc-500 hover:text-white">
          ← Back to {model}
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">{model} — {id}</h1>
        {record.userId && (
          <p className="text-zinc-500 text-sm mt-1">
            Owner:{" "}
            <Link href={`/admin/users/${record.userId}`} className="text-zinc-400 hover:underline">
              {record.userId}
            </Link>
          </p>
        )}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <pre className="text-sm text-zinc-300 whitespace-pre-wrap overflow-auto">
          {JSON.stringify(record, null, 2)}
        </pre>
      </div>
    </div>
  );
}
