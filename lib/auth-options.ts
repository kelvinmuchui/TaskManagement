// STEP 1: Create a new file: lib/auth-options.ts
// lib/auth-options.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserModel } from '@/lib/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Initialize admin if needed
          await UserModel.initializeAdmin();

          const user = await UserModel.findByUsername(credentials.username);
          
          if (!user) {
            return null;
          }

          const isValid = await UserModel.validatePassword(user, credentials.password);
          
          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.username,
            email: user.username, // NextAuth requires email field
            isAdmin: user.isAdmin
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as any).isAdmin;
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).username = token.username;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};