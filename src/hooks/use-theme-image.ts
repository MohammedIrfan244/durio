import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import themeTopic from "@/asset/theme-topic.json";

type ThemeTopic = typeof themeTopic;
type ModuleName = keyof ThemeTopic;

export function useThemeImage(): string | null {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();

  if (!resolvedTheme || !pathname) return null;

  const moduleName = pathname.split("/")[1]?.toLowerCase();

  if (moduleName && moduleName in themeTopic) {
    const moduleThemes = themeTopic[moduleName as ModuleName];
    if (resolvedTheme in moduleThemes) {
      return moduleThemes[resolvedTheme as keyof typeof moduleThemes] || null;
    }
  }

  return null;
}
