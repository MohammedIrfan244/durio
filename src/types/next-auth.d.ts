import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      timezone?: string | null;
      displayName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
      id: string;
      timezone?: string | null;
      displayName?: string | null;
  }
}
