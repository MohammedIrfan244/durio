import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import themeTopic from "@/assets/theme-topic.json";
import { useSettings } from "@/components/providers/settings-provider";

type ThemeTopic = typeof themeTopic;
type ModuleName = keyof ThemeTopic;

export function useThemeImage(): string | null {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const { fancyMode } = useSettings();

  if (!resolvedTheme || !pathname || !fancyMode) return null;

  const moduleName = pathname.split("/")[1]?.toLowerCase();

  if (moduleName && moduleName in themeTopic) {
    const moduleThemes = themeTopic[moduleName as ModuleName];
    if (resolvedTheme in moduleThemes) {
      return moduleThemes[resolvedTheme as keyof typeof moduleThemes] || null;
    }
  }

  return null;
}
