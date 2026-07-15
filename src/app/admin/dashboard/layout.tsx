import { redirect, notFound } from "next/navigation";
import { checkAdminAuth } from "@/server/actions/admin-auth";
import Link from "next/link";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await checkAdminAuth();
  
  if (!isAuth) {
    // Return 404 to hide the existence of the dashboard from unauthorized users
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-mono">
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">SYSTEM ADMIN</h1>
          <p className="text-xs text-zinc-500">DURIO COMMAND CENTER</p>
        </div>
        <nav className="flex gap-4">
          <Link href="/admin/dashboard" className="text-sm hover:text-white transition-colors">
            Overview
          </Link>
          <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">
            Exit to App
          </Link>
        </nav>
      </header>
      <main className="p-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
