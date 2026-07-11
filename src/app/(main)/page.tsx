import { Suspense } from "react";
import Dashboard from "@/components/pages/dashboard/dashboard";
import { APP_NAME } from "@/lib/brand";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: `Dashboard - ${APP_NAME}`,
  description:
    "Your personal daily command center. See your tasks, notes, calendar events, and AI usage at a glance.",
  openGraph: {
    title: `Dashboard - ${APP_NAME}`,
    description: "Your personal daily command center — tasks, notes, calendar, and AI in one place.",
    type: "website",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: `Dashboard - ${APP_NAME}`,
    description: "Your personal daily command center — tasks, notes, calendar, and AI in one place.",
  },
};


export default function Home() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <Dashboard />
    </Suspense>
  );
}

function DashboardFallback() {
  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8 space-y-6">
      <section className="rounded-2xl border border-border/50 bg-card/80 p-6 md:p-8">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="mt-6 h-10 w-2/3 max-w-xl" />
        <Skeleton className="mt-3 h-5 w-1/2 max-w-lg" />
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border/50 bg-card/80 py-0">
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
