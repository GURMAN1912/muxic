//@ts-expect-error
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string; // Add id here if it's coming from the database
  }

  interface Session {
    user: User;
  }
}
