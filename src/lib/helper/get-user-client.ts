import { useSession } from "next-auth/react"


export function getUserClient() { {
  const { data: session } = useSession();
  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "system",
  };
  return user;
  }
}