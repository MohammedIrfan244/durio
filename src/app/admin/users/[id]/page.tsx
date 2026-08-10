import { notFound } from "next/navigation";
import { headers } from "next/headers";
import UserExplorer from "@/components/admin/user-explorer-loader";

async function fetchSummary(id: string) {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = `${base}/api/admin/users/${id}/summary`;
  const requestHeaders = await headers();
  const res = await fetch(url, {
    cache: "no-store",
    headers: { cookie: requestHeaders.get("cookie") || "" },
  });
  if (!res.ok) {
    throw new Error("Failed to load summary");
  }
  return res.json();
}

function maskArray(arr: string[] | undefined) {
  if (!arr) return "-";
  return arr.map(s => (s.length > 8 ? s.slice(0, 3) + "****" + s.slice(-3) : "****")).join(", ");
}

export default async function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let summary: any;
  try {
    summary = await fetchSummary(id);
  } catch (e) {
    return notFound();
  }

  const { user, counts, latest } = summary;

  return (
    <div style={{ padding: 24 }}>
      <h1>User — {user.email}</h1>
      <p>ID: {user.id}</p>
      <p>Name: {user.name || user.displayName || "—"}</p>
      <p>Timezone: {user.timezone || "—"}</p>
      <p>Created: {new Date(user.createdAt).toLocaleString()}</p>

      <h2>Counts</h2>
      <ul>
        <li>Todos: {counts.todos}</li>
        <li>Notes: {counts.notes}</li>
        <li>Notifications: {counts.notifications}</li>
        <li>Events: {counts.events}</li>
        <li>Routine blocks: {counts.routineBlocks}</li>
        <li>Block logs: {counts.blockLogs}</li>
        <li>Resource links: {counts.resourceLinks}</li>
        <li>AI Usage: {counts.aiUsage ? `${counts.aiUsage.requestsToday} today, last ${new Date(counts.aiUsage.lastRequestAt).toLocaleString()}` : "-"}</li>
      </ul>

      <h2>FCM Tokens (masked)</h2>
      <p>{maskArray(user.fcmTokens)}</p>

      <h2>Latest items</h2>
      <section>
        <h3>Todos</h3>
        <pre>{JSON.stringify(latest.todos, null, 2)}</pre>
      </section>

      <section>
        <h3>Notes</h3>
        <pre>{JSON.stringify(latest.notes, null, 2)}</pre>
      </section>

      <section>
        <h3>Notifications</h3>
        <pre>{JSON.stringify(latest.notifications, null, 2)}</pre>
      </section>

      <UserExplorer userId={user.id} />

      <section>
        <h3>Raw User JSON</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </section>
    </div>
  );
}
