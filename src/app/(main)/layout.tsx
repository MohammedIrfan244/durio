import AppLayout from "@/components/layout/app-layout";
import { SettingsProvider } from "@/components/providers/settings-provider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <AppLayout>
        {children}
      </AppLayout>
    </SettingsProvider>
  );
}
