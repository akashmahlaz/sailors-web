
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import clientPromise from "@/lib/mongodb"

// Helper function to get the users collection
async function getUsersCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("users")
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const email = credentials.email as string
          const password = credentials.password as string

          // Get user from database
          const usersCollection = await getUsersCollection()
          const user = await usersCollection.findOne({ email })

          if (!user) {
            console.log("User not found:", email)
            return null
          }

          // Check if user has a password (might be OAuth-only user)
          if (!user.password) {
            console.log("User has no password (OAuth user):", email)
            return null
          }

          // Verify password
          const isPasswordValid = await compare(password, user.password)

          if (!isPasswordValid) {
            console.log("Invalid password for:", email)
            return null
          }

          // Return user object (this gets stored in the JWT)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "user",
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})