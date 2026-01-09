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
