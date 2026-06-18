import AppLayout from "@/components/layout/app-layout";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { DuriaProvider } from "@/components/providers/duria-provider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <DuriaProvider>
        <AppLayout>
          {children}
        </AppLayout>
      </DuriaProvider>
    </SettingsProvider>
  );
}
