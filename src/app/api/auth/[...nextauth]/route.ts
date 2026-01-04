import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 1. Check Auth Intent
      const { getAuthIntent, clearAuthIntent } = await import("@/server/auth-intent");
      // @ts-ignore
      const intent = await getAuthIntent();

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (intent === "login") {
        if (!existingUser) {
          // If trying to login but no text-user, ideally show error.
          // NextAuth URL error: /api/auth/signin?error=AccessDenied
          // checking constraint logic...
          // For now we just return false to deny.
          return "/auth/login?error=AccountNotFound"; 
        }
        return true;
      }

      if (intent === "register") {
        if (existingUser) {
           return "/auth/login?error=AccountExists";
        }
        // Allow creation
        return true; 
      }
      
      // If no intent (e.g. direct link or legacy or auto), default to...
      // If user exists, allow login. If not, maybe block?
      // Since we want explicit, let's block creation if no intent.
      if (!existingUser) {
          return "/auth/login?error=InvalidIntent";
      }

      return true;
    },
    async session({ session, token }) {
        const authUser = await prisma.user.findFirst({
          where: { email: session.user?.email || "" },
        });

        if (!authUser) {
          // This should ideally not happen if signIn callback works correctly for blocking
          // But if it does, we create user? No, we should have created it in signIn if needed or let NextAuth adapter do it.
          // Since we use manual provider logic here without adapter?
          // Wait, the original code had manual creation in session callback.
          // We should MOVE that to signIn or ensure it happens.
          
          // Original logic:
          const newUser = await prisma.user.create({
            data: {
              name: session.user?.name || "No Name",
              email: session.user?.email || "",
            },
          });
           return {...session, user: { ...session.user, id: newUser.id , token: token, timezone: newUser.timezone, displayName: newUser.displayName } };
        }
        
        return { ...session, user: { ...session.user, id: authUser.id , token: token, timezone: authUser.timezone, displayName: authUser.displayName } };
    },
  },
});

export { handler as GET, handler as POST };
