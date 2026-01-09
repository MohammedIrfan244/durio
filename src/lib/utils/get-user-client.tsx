import { useSession } from "next-auth/react";

export function useUserClient() {
  const { data: session } = useSession();

  return {
    name: session?.user?.name || "User",
    email: session?.user?.email || "system",
  };
}
