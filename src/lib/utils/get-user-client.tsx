import { useSession } from "next-auth/react";

export function useUserClient() {
  const { data: session } = useSession();

  return {
    displayName: session?.user?.displayName || undefined,
    name: session?.user?.name || "User",
    email: session?.user?.email || "system",
  };
}
