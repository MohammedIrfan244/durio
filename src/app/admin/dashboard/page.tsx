import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminDashboardPage() {
  const [
    userCount,
    todoCount,
    noteCount,
    eventCount,
    recentLogs,
    users,
    todosByStatus,
    aiUsages
  ] = await Promise.all([
    prisma.user.count(),
    prisma.todo.count(),
    prisma.note.count(),
    prisma.event.count(),
    prisma.systemLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true, disabledModules: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.todo.groupBy({
      by: ['status'],
      _count: { id: true }
    }),
    prisma.aIUsage.aggregate({
      _sum: { requestsToday: true }
    })
  ]);

  const totalAiRequests = aiUsages._sum.requestsToday || 0;

  // Process todo stats
  const todoStats = {
    DONE: 0,
    PENDING: 0,
    OVERDUE: 0,
    OTHER: 0,
  };
  todosByStatus.forEach((stat) => {
    if (stat.status === 'DONE') todoStats.DONE += stat._count.id;
    else if (stat.status === 'PENDING') todoStats.PENDING += stat._count.id;
    else if (stat.status === 'OVERDUE') todoStats.OVERDUE += stat._count.id;
    else todoStats.OTHER += stat._count.id;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Duria Admin</h1>
          <p className="text-zinc-500 text-sm">System oversight and user management.</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 text-zinc-400 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Users</TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard title="TOTAL USERS" value={userCount} />
            <StatCard title="TOTAL TODOS" value={todoCount} />
            <StatCard title="TOTAL NOTES" value={noteCount} />
            <StatCard title="TOTAL EVENTS" value={eventCount} />
            <StatCard title="AI QUERIES" value={totalAiRequests} color="text-emerald-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Todo Status Distribution</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">DONE</span>
                  <span className="text-white font-mono">{todoStats.DONE}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${todoCount ? (todoStats.DONE / todoCount) * 100 : 0}%` }}></div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-zinc-400 text-sm">PENDING</span>
                  <span className="text-white font-mono">{todoStats.PENDING}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${todoCount ? (todoStats.PENDING / todoCount) * 100 : 0}%` }}></div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-zinc-400 text-sm">OVERDUE</span>
                  <span className="text-white font-mono">{todoStats.OVERDUE}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${todoCount ? (todoStats.OVERDUE / todoCount) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
               <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Recent Signups</h2>
               <div className="space-y-4">
                 {users.slice(0, 5).map(u => (
                   <div key={u.id} className="flex justify-between items-center pb-4 border-b border-zinc-800/50 last:border-0 last:pb-0">
                     <div>
                       <p className="text-white text-sm font-medium">{u.name || "Unknown"}</p>
                       <p className="text-zinc-500 text-xs">{u.email}</p>
                     </div>
                     <span className="text-xs text-zinc-400 font-mono">
                       {u.createdAt.toLocaleDateString()}
                     </span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">ALL USERS</h2>
              <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">{users.length} Users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 bg-zinc-950/50 uppercase border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Joined Date</th>
                    <th className="px-6 py-3">Disabled Modules</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="px-6 py-4 text-white font-medium">
                        {u.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 whitespace-nowrap">
                        {u.createdAt.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {u.disabledModules.length > 0 ? u.disabledModules.join(", ") : "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">SYSTEM AUDIT LOGS</h2>
              <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded">Last 100 Events</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 bg-zinc-950/50 uppercase border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Level</th>
                    <th className="px-6 py-3">Message</th>
                    <th className="px-6 py-3">User ID</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-zinc-500">
                        No logs found.
                      </td>
                    </tr>
                  )}
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-400 text-xs">
                        {log.createdAt.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.level === 'ERROR' ? 'bg-red-900/30 text-red-400 border border-red-800' :
                          log.level === 'WARNING' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' :
                          'bg-zinc-800 text-zinc-300'
                        }`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                        {log.userId || "SYSTEM"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
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
