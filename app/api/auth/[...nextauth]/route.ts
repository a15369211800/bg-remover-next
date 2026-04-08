import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getUserByEmail, getUserByGoogleId, createUser } from "@/lib/db"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Check if user exists
          let dbUser = await getUserByEmail(user.email);
          
          if (!dbUser && profile?.sub) {
            // Create new user
            dbUser = await createUser({
              id: crypto.randomUUID(),
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              google_id: profile.sub,
            });
          }
          
          return true;
        } catch (error) {
          console.error('Sign in error:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        
        // Get user from DB to include credits
        try {
          const dbUser = await getUserByEmail(session.user.email!);
          if (dbUser) {
            session.user.credits = dbUser.credits;
          }
        } catch (error) {
          console.error('Session error:', error);
        }
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }
