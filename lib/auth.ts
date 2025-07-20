import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import { compare } from "bcryptjs"
import { getUsersCollection } from "@/lib/mongodb"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        const usersCollection = await getUsersCollection()
        const user = await usersCollection.findOne({ email: credentials.email })

        if (!user) {
          throw new Error("No user found with this email")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        // Update last login time
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { lastLogin: new Date() } }
        )

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          lastLogin: new Date(),
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    signOut: "/signin",
    error: "/signin",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Upsert user in users collection for OAuth and credentials
      if (user && user.email) {
        const usersCollection = await getUsersCollection();
        const existingUser = await usersCollection.findOne({ email: user.email });
        let userId;
        if (!existingUser) {
          // Insert new user for OAuth sign-in
          const result = await usersCollection.insertOne({
            name: user.name || profile?.name || "Sailor",
            email: user.email,
            role: "user",
            createdAt: new Date(),
            oauth: account?.provider || null,
          });
          userId = result.insertedId.toString();
        } else {
          userId = existingUser._id.toString();
        }
        // Ensure user profile exists
        const { createUserProfile, getUserProfileByUserId } = await import("@/lib/user-profiles");
        const profileDoc = await getUserProfileByUserId(userId);
        if (!profileDoc) {
          await createUserProfile({
            userId,
            name: user.name || profile?.name || "Sailor",
            email: user.email,
            bio: "",
            location: "",
            profileImage: "",
            coverImage: "",
            role: "user",
            joinedAt: new Date(),
            updatedAt: new Date(),
            socialLinks: {},
            following: [],
            followers: [],
            interests: [],
            expertise: [],
          });
        }
        token.id = userId;
        token.role = user.role || existingUser?.role || "user";
        token.lastLogin = new Date();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.lastLogin = token.lastLogin as Date
      }
      return session
    },
  },
}
