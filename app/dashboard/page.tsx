"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { UserCircle } from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Card className="border border-gray-200 shadow-md dark:border-gray-800 dark:shadow-none max-w-3xl mx-auto">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Dashboard</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Welcome to your account overview</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Hello, {session?.user?.name || "User"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium text-gray-700 dark:text-gray-300">Email:</span> {session?.user?.email}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium text-gray-700 dark:text-gray-300">User ID:</span> {session?.user?.id}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium text-gray-700 dark:text-gray-300">Role:</span> {session?.user?.role}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium text-gray-700 dark:text-gray-300">Status:</span> {session?.user?.isActive ? "Active" : "Inactive"}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium text-gray-700 dark:text-gray-300">Last login:</span> {session?.user?.lastLogin ? new Date(session.user.lastLogin).toLocaleString() : "-"}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium text-gray-700 dark:text-gray-300">Created:</span> {session?.user?.createdAt ? new Date(session.user.createdAt).toLocaleString() : "-"}</p>
                <p className="text-gray-600 dark:text-gray-400"><span className="font-medium text-gray-700 dark:text-gray-300">Updated:</span> {session?.user?.updatedAt ? new Date(session.user.updatedAt).toLocaleString() : "-"}</p>
              </div>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Button onClick={() => router.push("/podcasts")} className="bg-gray-700 hover:bg-gray-800 text-white font-medium shadow-sm">
                Podcasts
              </Button>
              <Button onClick={() => router.push("/news")} className="bg-gray-700 hover:bg-gray-800 text-white font-medium shadow-sm">
                News
              </Button>
              <Button onClick={() => router.push("/videos")} className="bg-gray-700 hover:bg-gray-800 text-white font-medium shadow-sm">
                Videos
              </Button>
              <Button onClick={() => router.push("/photos")} className="bg-gray-700 hover:bg-gray-800 text-white font-medium shadow-sm">
                Photos
              </Button>
              <Button>
                 <Link
                    href={`/profile/${session?.user?.id || 'me'}`}
                    className="flex items-center py-2 text-sm rounded-lg text-gray-200 hover:bg-gray-400 dark:text-gray-800 dark:hover:bg-gray-300"
                    
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
                className="text-gray-700 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-900 font-medium p-2 m-2 "
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
