import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import { checkAdminAuth } from "@/server/actions/admin-auth";
import { notFound } from "next/navigation";
import { getDashboardSummary } from "@/server/admin-resolvers";

export default async function AdminDashboardPage() {

  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    notFound();
  }

  const {
    userCount,
    todoCount,
    noteCount,
    eventCount,
    recentLogs,
    users,
    todosByStatus,
    totalAiRequests,
  } = await getDashboardSummary();

  // Process todo stats
  const todoStats = {
    DONE: 0,
    PENDING: 0,
    OVERDUE: 0,
    OTHER: 0,
  };
  todosByStatus.forEach((stat: { status: string; _count: { id: number; }; }) => {
    if (stat.status === 'DONE') todoStats.DONE += stat._count.id;
    else if (stat.status === 'PENDING') todoStats.PENDING += stat._count.id;
    else if (stat.status === 'OVERDUE') todoStats.OVERDUE += stat._count.id;
    else todoStats.OTHER += stat._count.id;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Super Admin</h1>
          <p className="text-zinc-500 text-sm">Quick access to user observability and DB explorer.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Users" value={userCount} />
            <StatCard title="Todos" value={todoCount} />
            <StatCard title="Notes" value={noteCount} />
            <StatCard title="Events" value={eventCount} />
            <StatCard title="AI Queries" value={totalAiRequests} color="text-emerald-400" />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Tools</h2>
            <ul className="space-y-3">
              <li><a className="text-white underline" href="/admin/users">User List & Search</a></li>
              <li><a className="text-white underline" href="/admin/db">DB Explorer</a></li>
              <li><a className="text-white underline" href="/admin/dashboard">System Audit Logs</a></li>
            </ul>
          </div>
          <div className="text-xs text-zinc-500 mt-6">Use these tools to inspect user data, explore models, and audit admin actions.</div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Recent Activity</h2>
          <div className="space-y-3 text-sm text-zinc-400">
            {recentLogs.slice(0, 8).map((log: { id: Key | null | undefined; message: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; createdAt: string | number | Date; userId: any; level: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
              <div key={log.id} className="border-b border-zinc-800/40 pb-2">
                <div className="flex justify-between">
                  <div>{log.message}</div>
                  <div className="text-xs text-zinc-500">{new Date(log.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-xs text-zinc-500">{log.userId || 'SYSTEM'} — {log.level}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color = "text-white" }: { title: string; value: number, color?: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-2">
      <h3 className="text-xs text-zinc-500 uppercase tracking-wider">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
    </div>
  );
}
