import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { OAuth2Client } from "google-auth-library";
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "google-native",
      name: "Google Native",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) {
          return null;
        }

        try {
          const client = new OAuth2Client();
          // We verify the token using the Web Client ID (since the native plugin requests it as the serverClientId)
          const ticket = await client.verifyIdToken({
            idToken: credentials.idToken,
            audience: [process.env.GOOGLE_CLIENT_ID!],
          });
          
          const payload = ticket.getPayload();
          if (!payload || !payload.email) return null;

          return {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            image: payload.picture,
          };
        } catch (error) {
          console.error("Error verifying native Google token:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    state: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.state" : "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 900
      }
    },
    pkceCodeVerifier: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.pkce.code_verifier" : "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 900
      }
    }
  },
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
