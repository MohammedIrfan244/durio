import Dashboard from "@/components/pages/dashboard/dashboard";
import { APP_NAME } from "@/lib/brand";
export const metadata = {
  title: `Dashboard - ${APP_NAME}`,
  description: "Your personal daily companion",
};

export default function Home() {
  return (
   <Dashboard />
  );
}
