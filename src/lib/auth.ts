import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            return null
          }

          // Check if password is hashed or plain text
          let isValidPassword = false
          
          if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            // Password is hashed, use bcrypt
            isValidPassword = await bcrypt.compare(credentials.password, user.password)
          } else {
            // For development/demo - plain text comparison
            // NEVER use this in production!
            isValidPassword = credentials.password === user.password
          }

          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
      }
      return session  // ← FIXED: Return session, not token
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt"
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
export const { auth, signIn, signOut } = handler

export default handler