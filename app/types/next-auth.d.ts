// Importing NextAuth only if necessary; otherwise, it can be removed
// @ts-expect-error: NextAuth is not used here; necessary for module augmentation
import NextAuth from "next-auth"; // Only keep if needed elsewhere

declare module "next-auth" {
  interface User {
    id: string; // Add id here if it's coming from the database
  }

  interface Session {
    user: User;
  }
}
