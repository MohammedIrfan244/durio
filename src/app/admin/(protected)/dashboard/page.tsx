import { checkAdminAuth } from "@/server/actions/admin-auth";
import { notFound } from "next/navigation";
import { getDashboardSummary } from "@/server/admin-resolvers";
import Link from "next/link";

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
  const todoStats: Record<string, number> = {};
  todosByStatus.forEach((stat: { status: string; _count: { id: number } }) => {
    todoStats[stat.status] = stat._count.id;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">System overview and recent activity.</p>
      </div>

      {/* Overview Stats */}
      <section>
        <h2 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <StatCard title="Users" value={userCount} />
          <StatCard title="Todos" value={todoCount} />
          <StatCard title="Notes" value={noteCount} />
          <StatCard title="Events" value={eventCount} />
          <StatCard title="AI Requests" value={totalAiRequests} />
        </div>
      </section>

      {/* Todo Status Breakdown */}
      <section>
        <h2 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">Todos by Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {Object.entries(todoStats).map(([status, count]) => (
            <StatCard key={status} title={status} value={count} />
          ))}
        </div>
      </section>

      {/* All Users */}
      <section>
        <h2 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">
          All Users ({users.length})
        </h2>
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Disabled Modules</th>
                <th className="px-4 py-2 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((user: { id: string; name: string | null; email: string; createdAt: string | Date; disabledModules: string[] }) => (
                <tr key={user.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-2">
                    <Link href={`/admin/users/${user.id}`} className="text-white hover:underline">
                      {user.name || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-zinc-400">{user.email}</td>
                  <td className="px-4 py-2 text-zinc-500">
                    {user.disabledModules?.length > 0 ? user.disabledModules.join(", ") : "None"}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Activity / System Logs */}
      <section>
        <h2 className="text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">
          System Logs ({recentLogs.length})
        </h2>
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Level</th>
                <th className="px-4 py-2 font-medium">Message</th>
                <th className="px-4 py-2 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {recentLogs.map((log: { id: string; level: string; message: string; userId: string | null; createdAt: string | Date }) => (
                <tr key={log.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      log.level === "ERROR" ? "bg-red-900/50 text-red-400" :
                      log.level === "WARNING" ? "bg-yellow-900/50 text-yellow-400" :
                      "bg-zinc-800 text-zinc-400"
                    }`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-zinc-300 max-w-md truncate">{log.message}</td>
                  <td className="px-4 py-2 text-zinc-500">
                    {log.userId ? (
                      <Link href={`/admin/users/${log.userId}`} className="hover:underline">{log.userId}</Link>
                    ) : "SYSTEM"}
                  </td>
                  <td className="px-4 py-2 text-zinc-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value.toLocaleString()}</p>
    </div>
  );
}
