// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials || !credentials.username || !credentials.password) {
          throw new Error("Please provide both username and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.username },
        });

        if (!user) {
          throw new Error("User Not Found");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (user) {
        session.user.id = user.id;
      } else if (token) {
        session.user.id = token.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  trustHost: true, // Add this line
};

const { handlers, signIn, signOut, auth } = NextAuth(authOptions);

export { handlers, signIn, signOut, auth };
