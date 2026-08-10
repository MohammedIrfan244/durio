import Link from "next/link";
import { headers } from "next/headers";

async function fetchUsers(page: number, limit: number, q: string) {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = `${base}/api/admin/users?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`;
  const requestHeaders = await headers();
  const res = await fetch(url, {
    cache: "no-store",
    headers: { cookie: requestHeaders.get("cookie") || "" },
  });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; limit?: string; q?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const page = Math.max(1, parseInt(resolvedParams.page || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(resolvedParams.limit || "20")));
  const q = resolvedParams.q || "";

  const data = await fetchUsers(page, limit, q);
  const { total, users } = data;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
        <p className="text-zinc-500 text-sm mt-1">{total} total users</p>
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          name="q"
          type="text"
          placeholder="Search by name, email, or ID..."
          defaultValue={q}
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
        />
        <button
          type="submit"
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Search
        </button>
      </form>

      {/* Users Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-400 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Display Name</th>
              <th className="px-4 py-2 font-medium">Timezone</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user: { id: string; name: string | null; email: string; displayName: string | null; avatar: string | null; timezone: string | null; createdAt: string | Date }) => (
              <tr key={user.id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-2">
                  <Link href={`/admin/users/${user.id}`} className="text-white hover:underline flex items-center gap-2">
                    {user.avatar && (
                      <img src={user.avatar} alt="" className="w-5 h-5 rounded-full" />
                    )}
                    {user.name || "—"}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-400">{user.email}</td>
                <td className="px-4 py-2 text-zinc-400">{user.displayName || "—"}</td>
                <td className="px-4 py-2 text-zinc-500">{user.timezone || "—"}</td>
                <td className="px-4 py-2 text-zinc-500 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-zinc-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/users?page=${page - 1}&limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-white hover:bg-zinc-700"
              >
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/users?page=${page + 1}&limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-white hover:bg-zinc-700"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
