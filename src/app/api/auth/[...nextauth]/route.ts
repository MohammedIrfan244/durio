import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createServerLog } from "@/server/server-log";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
        const authUser = await prisma.user.findFirst({
          where: { email: session.user?.email || "" },
        });

        await createServerLog({
          level: "INFO",
          message: `User logged in with email: ${session.user?.email}`,
          userId: authUser?.id,
        });

        if (!authUser) {
          const newUser = await prisma.user.create({
            data: {
              name: session.user?.name || "No Name",
              email: session.user?.email || "",
            },
          });

          await createServerLog({
            level: "INFO",
            message: `New user created with email: ${session.user?.email}`,
            userId: newUser.id,
          });

      return {...session, user: { ...session.user, id: newUser.id , token: token } };
        }
        
        return { ...session, user: { ...session.user, id: authUser.id , token: token } };
    },
  },
});

export { handler as GET, handler as POST };
