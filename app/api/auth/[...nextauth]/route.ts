import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

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
          // Access D1 via fetch to a dedicated API route
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user/upsert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              google_id: profile?.sub,
            }),
          });
          if (!response.ok) throw new Error('Failed to upsert user');
          return true;
        } catch (error) {
          console.error('Sign in error:', error);
          return true; // Still allow sign in even if DB fails
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        // Fetch credits from DB
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/user/credits?email=${session.user.email}`);
          if (response.ok) {
            const data = await response.json();
            session.user.credits = data.credits;
          }
        } catch (error) {
          console.error('Session credits error:', error);
        }
      }
      return session;
    },
  },
})

export { handler as GET, handler as POST }
