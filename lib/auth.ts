// Compatibility layer for existing API routes
// This file provides backward compatibility for imports from @/lib/auth

import { auth } from "@/auth"
import { authConfig } from "@/auth.config"

// Re-export providers for compatibility
export { default as CredentialsProvider } from "next-auth/providers/credentials"
export { default as GoogleProvider } from "next-auth/providers/google"
export { default as GithubProvider } from "next-auth/providers/github"

export const authOptions = authConfig

// Helper function to get server session
// In next-auth v5, use auth() from @/auth
export async function getServerSession() {
  try {
    const session = await auth()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}
