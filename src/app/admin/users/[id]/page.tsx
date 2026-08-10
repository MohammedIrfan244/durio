import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
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
  if (!arr || arr.length === 0) return "None";
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
    <div className="space-y-8">
      {/* Back link + Header */}
      <div>
        <Link href="/admin/users" className="text-sm text-zinc-500 hover:text-white">
          ← Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">{user.email}</h1>
        <p className="text-zinc-500 text-sm">ID: {user.id}</p>
      </div>

      {/* User Profile Info */}
      <section>
        <h2 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Profile</h2>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Field label="Name" value={user.name} />
            <Field label="Display Name" value={user.displayName} />
            <Field label="Email" value={user.email} />
            <Field label="Timezone" value={user.timezone} />
            <Field label="Fancy Mode" value={user.fancyMode ? "Enabled" : "Disabled"} />
            <Field label="Created" value={new Date(user.createdAt).toLocaleString()} />
            <Field label="Avatar" value={user.avatar ? user.avatar : null} />
            <Field label="Disabled Modules" value={user.disabledModules?.length > 0 ? user.disabledModules.join(", ") : "None"} />
            <Field label="FCM Tokens" value={maskArray(user.fcmTokens)} />
          </div>
        </div>
      </section>

      {/* Counts */}
      <section>
        <h2 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Counts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <CountCard title="Todos" value={counts.todos} />
          <CountCard title="Notes" value={counts.notes} />
          <CountCard title="Notifications" value={counts.notifications} />
          <CountCard title="Events" value={counts.events} />
          <CountCard title="Routine Blocks" value={counts.routineBlocks} />
          <CountCard title="Block Logs" value={counts.blockLogs} />
          <CountCard title="Resource Links" value={counts.resourceLinks} />
          <CountCard title="Todo Streaks" value={counts.todoStreaks} />
        </div>
        {counts.aiUsage && (
          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm">
            <span className="text-zinc-400">AI Usage:</span>{" "}
            <span className="text-white">{counts.aiUsage.requestsToday} requests today</span>
            {counts.aiUsage.lastRequestAt && (
              <span className="text-zinc-500"> — last at {new Date(counts.aiUsage.lastRequestAt).toLocaleString()}</span>
            )}
          </div>
        )}
      </section>

      {/* Latest Todos */}
      <DataTable
        title={`Todos (${latest.todos.length})`}
        columns={["Title", "Status", "Created", "Updated"]}
        rows={latest.todos.map((t: any) => [t.title, t.status, new Date(t.createdAt).toLocaleDateString(), new Date(t.updatedAt).toLocaleDateString()])}
      />

      {/* Latest Notes */}
      <DataTable
        title={`Notes (${latest.notes.length})`}
        columns={["Heading", "Status", "Created", "Updated"]}
        rows={latest.notes.map((n: any) => [n.heading, n.status, new Date(n.createdAt).toLocaleDateString(), new Date(n.updatedAt).toLocaleDateString()])}
      />

      {/* Latest Notifications */}
      <DataTable
        title={`Notifications (${latest.notifications.length})`}
        columns={["Message", "Read", "Created"]}
        rows={latest.notifications.map((n: any) => [n.message, n.read ? "Yes" : "No", new Date(n.createdAt).toLocaleDateString()])}
      />

      {/* Latest Events */}
      <DataTable
        title={`Events (${latest.events.length})`}
        columns={["Title", "Start", "End", "Created"]}
        rows={latest.events.map((e: any) => [e.title, new Date(e.startDate).toLocaleDateString(), new Date(e.endDate).toLocaleDateString(), new Date(e.createdAt).toLocaleDateString()])}
      />

      {/* Latest Routine Blocks */}
      <DataTable
        title={`Routine Blocks (${latest.routineBlocks.length})`}
        columns={["Title", "Active", "Created"]}
        rows={latest.routineBlocks.map((r: any) => [r.title, r.isActive ? "Yes" : "No", new Date(r.createdAt).toLocaleDateString()])}
      />

      {/* Latest Block Logs */}
      <DataTable
        title={`Block Logs (${latest.blockLogs.length})`}
        columns={["Status", "Date", "Created"]}
        rows={latest.blockLogs.map((b: any) => [b.status, new Date(b.date).toLocaleDateString(), new Date(b.createdAt).toLocaleDateString()])}
      />

      {/* Latest Resource Links */}
      <DataTable
        title={`Resource Links (${latest.resourceLinks.length})`}
        columns={["From Type", "From ID", "To Type", "To ID", "Created"]}
        rows={latest.resourceLinks.map((r: any) => [r.fromType, r.fromId, r.toType, r.toId, new Date(r.createdAt).toLocaleDateString()])}
      />

      {/* User Explorer (client component) */}
      <section>
        <h2 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Deep Explore</h2>
        <UserExplorer userId={user.id} />
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-zinc-500 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white mt-0.5 break-all">{value || "—"}</p>
    </div>
  );
}

function CountCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{title}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function DataTable({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) {
  if (rows.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">{title}</h2>
      <div className="rounded-lg border border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-400 text-left">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 font-medium whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-zinc-900/50">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-zinc-300 max-w-xs truncate">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
