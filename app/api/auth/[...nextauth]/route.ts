import { prismaClient } from "@/app/lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface User {
    id: string; // Add the user ID type
  }

  interface Session {
    user: User; // Ensure user is defined
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        // Fetch the user by email
        if (!user.email) {
          throw new Error("No email provided");
        }

        const existingUser = await prismaClient.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create a new user if not found
          const newUser = await prismaClient.user.create({
            data: {
              email: user.email,
            },
          });
          user.id = newUser.id;
        } else {
          // Assign the existing user ID
          user.id = existingUser.id;
        }
      } catch (error) {
        console.error("Error during signIn callback:", error);
        return false; // Prevent sign-in if error occurs
      }
      return true; // Allow sign-in
    },

    async jwt({ token, user }) {
      if (user) {
        // Fetch user ID and add it to the token
        const dbUser = await prismaClient.user.findUnique({
          where: { email: user.email ?? "" },
        });

        token.id = dbUser?.id ?? ""; // Ensure token gets the ID
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string; // Add user ID to session
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
