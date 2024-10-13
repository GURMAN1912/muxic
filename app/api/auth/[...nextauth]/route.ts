import { prismaClient } from "@/app/lib/db"
import NextAuth from "next-auth"

import GoogleProvider from "next-auth/providers/google"
declare module "next-auth" {
    interface User {
      id: string; // Add the user ID type
    }
  
    interface Session {
      user: User; // Ensure user is defined
    }
  }


const handler=NextAuth({
    providers:[
        GoogleProvider({
            clientId:process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret:process.env.GOOGLE_CLIENT_SECRET ?? "" 
        })
    ],
    callbacks:{
        async signIn(params){
            console.log(params)
            const user = params.user;
            try{
                const existingUser = await prismaClient.user.findUnique({
                    where: { email: params.user.email??"" }
                  });
                  if(!existingUser){

                const newUser= await prismaClient.user.create({
                    data:{
                        email:params.user.email ??"",
                    }
                })
                user.id=newUser.id;                
            }
            else{
                user.id=existingUser.id;
            }
            }
            catch(e){
                console.log(e)
            }
            return true;
        },
        async jwt({ token, user }) {
            // If user is signing in, add the user ID from the database to the token
            if (user) {
              const dbUser = await prismaClient.user.findUnique({
                where: { email: user.email ?? "" },
              });
      
              token.id = dbUser?.id ?? ""; // Add user ID to token
            }
            return token;
          },
          async session({ session, token }) {
            if (session.user && token?.id) {
              session.user.id = token.id as string; // Add user ID to session
            }
            return session;
          },
    }
})
export{handler as GET,handler as POST}