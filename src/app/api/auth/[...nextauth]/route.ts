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
