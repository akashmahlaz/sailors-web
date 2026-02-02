"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { UserCircle, LifeBuoy } from "lucide-react"

interface UserProfile {
  joinedAt: string
  updatedAt: string
  status?: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    }
  }, [status, router])

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/profile`)
          if (response.ok) {
            const data = await response.json()
            setUserProfile(data)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }
    }

    fetchUserProfile()
  }, [session?.user?.id])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <Card className="border border-gray-200 shadow-lg dark:border-gray-700 dark:shadow-none max-w-3xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
          <CardTitle className="text-2xl font-semibold text-primary dark:text-primary tracking-tight">Dashboard</CardTitle>
          <CardDescription className="text-muted-foreground">Welcome to your account overview</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-foreground">Hello, {session?.user?.name || "User"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Email:</span> {session?.user?.email}</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground">User ID:</span> {session?.user?.id}</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Role:</span> {session?.user?.role || "User"}</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Status:</span> {userProfile?.status || "Active"}</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Last login:</span> {session?.user?.lastLogin ? new Date(session.user.lastLogin).toLocaleString() : "Just now"}</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Joined:</span> {userProfile?.joinedAt ? new Date(userProfile.joinedAt).toLocaleString() : "-"}</p>
                <p className="text-muted-foreground"><span className="font-medium text-foreground">Last updated:</span> {userProfile?.updatedAt ? new Date(userProfile.updatedAt).toLocaleString() : "-"}</p>
              </div>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
               <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors duration-200">
                Home
              </Button>

              <Button onClick={() => router.push("/support")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors duration-200">
                <LifeBuoy className="mr-2 h-4 w-4" />
                Submit Request
              </Button>

              <Button onClick={() => router.push("/support/my-requests")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors duration-200">
                My Requests
              </Button>

              <Button onClick={() => router.push("/podcasts")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors duration-200">
                Podcasts
              </Button>
              <Button onClick={() => router.push("/news")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors duration-200">
                News
              </Button>
              <Button onClick={() => router.push("/videos")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors duration-200">
                Videos
              </Button>
              <Button onClick={() => router.push("/audio")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors duration-200">
                Audio
              </Button>
              <Button onClick={() => router.push("/photos")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors duration-200">
                Photos
              </Button>
             <Button onClick={() => router.push("/blog")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors duration-200">
                Blog
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors duration-200">
                 <Link
                    href={`/profile/${session?.user?.id || 'me'}`}
                    className="flex items-center justify-center w-full"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
              </Button>
            </div>
            <div className="flex m-2">
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground font-medium p-2 m-2 transition-colors duration-200"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
