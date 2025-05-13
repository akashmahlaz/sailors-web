"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, LifeBuoy, BarChart3, FileText, Bell, ClipboardList, UserCog } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (status === "authenticated" && session?.user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-slate-50 to-cyan-50 dark:from-slate-950 dark:to-cyan-950">
      <h1 className="mb-6 text-3xl font-bold text-cyan-900 dark:text-cyan-100">Captain's Quarters</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="border-b border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-cyan-50 to-white dark:from-slate-900 dark:to-cyan-950">
            <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Analytics
            </CardTitle>
            <CardDescription>Platform statistics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-cyan-700 dark:text-cyan-300">
              Access detailed analytics about user activity, content performance, and platform growth.
            </p>
            <Link href="/admin/analytics">
              <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="border-b border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-cyan-50 to-white dark:from-slate-900 dark:to-cyan-950">
            <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Content
            </CardTitle>
            <CardDescription>Manage all content</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-cyan-700 dark:text-cyan-300">
              Review, edit, and delete content across the platform including videos, audio, photos, and blogs.
            </p>
            <Link href="/admin/content">
              <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
                Manage Content
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="border-b border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-cyan-50 to-white dark:from-slate-900 dark:to-cyan-950">
            <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
              <UserCog className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Users
            </CardTitle>
            <CardDescription>Manage user accounts</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-cyan-700 dark:text-cyan-300">
              Manage user accounts, roles, permissions, and status across the platform.
            </p>
            <Link href="/admin/users">
              <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="border-b border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-cyan-50 to-white dark:from-slate-900 dark:to-cyan-950">
            <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
              <Bell className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Notifications
            </CardTitle>
            <CardDescription>Admin alerts</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-cyan-700 dark:text-cyan-300">
              View and manage system notifications and alerts for important platform events.
            </p>
            <Link href="/admin/notifications">
              <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
                View Notifications
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="border-b border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-cyan-50 to-white dark:from-slate-900 dark:to-cyan-950">
            <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Activity Logs
            </CardTitle>
            <CardDescription>Admin actions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-cyan-700 dark:text-cyan-300">
              View detailed logs of all administrative actions for accountability and auditing.
            </p>
            <Link href="/admin/activity-logs">
              <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
                View Activity Logs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="border-b border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-cyan-50 to-white dark:from-slate-900 dark:to-cyan-950">
            <CardTitle className="text-cyan-800 dark:text-cyan-200 flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              Support
            </CardTitle>
            <CardDescription>Sailor assistance</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-cyan-700 dark:text-cyan-300">
              Review and respond to sailor support requests and concerns.
            </p>
            <Link href="/admin/support">
              <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
                Manage Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
