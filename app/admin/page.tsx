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
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 min-h-screen">
      <h1 className="mb-6 text-3xl font-bold text-emerald-900 dark:text-emerald-100">Captain's Quarters</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-emerald-200 shadow-lg dark:border-emerald-900 dark:shadow-none">
          <CardHeader className="border-b border-emerald-100 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 to-white dark:from-slate-900 dark:to-emerald-950">
            <CardTitle className="text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Analytics
            </CardTitle>
            <CardDescription>Platform statistics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-emerald-700 dark:text-emerald-300">
              Access detailed analytics about user activity, content performance, and platform growth.
            </p>
            <Link href="/admin/analytics">
              <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-lg dark:border-emerald-900 dark:shadow-none">
          <CardHeader className="border-b border-emerald-100 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 to-white dark:from-slate-900 dark:to-emerald-950">
            <CardTitle className="text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Content
            </CardTitle>
            <CardDescription>Manage all content</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-emerald-700 dark:text-emerald-300">
              Review, edit, and delete content across the platform including videos, audio, photos, and blogs.
            </p>
            <Link href="/admin/content">
              <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white">
                Manage Content
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-lg dark:border-emerald-900 dark:shadow-none">
          <CardHeader className="border-b border-emerald-100 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 to-white dark:from-slate-900 dark:to-emerald-950">
            <CardTitle className="text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
              <UserCog className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Users
            </CardTitle>
            <CardDescription>Manage user accounts</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-emerald-700 dark:text-emerald-300">
              Manage user accounts, roles, permissions, and status across the platform.
            </p>
            <Link href="/admin/users">
              <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-emerald-200 shadow-lg dark:border-emerald-900 dark:shadow-none">
          <CardHeader className="border-b border-emerald-100 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 to-white dark:from-slate-900 dark:to-emerald-950">
            <CardTitle className="text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Notifications
            </CardTitle>
            <CardDescription>Admin alerts</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-emerald-700 dark:text-emerald-300">
              View and manage system notifications and alerts for important platform events.
            </p>
            <Link href="/admin/notifications">
              <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white">
                View Notifications
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-lg dark:border-emerald-900 dark:shadow-none">
          <CardHeader className="border-b border-emerald-100 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 to-white dark:from-slate-900 dark:to-emerald-950">
            <CardTitle className="text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Activity Logs
            </CardTitle>
            <CardDescription>Admin actions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-emerald-700 dark:text-emerald-300">
              View detailed logs of all administrative actions for accountability and auditing.
            </p>
            <Link href="/admin/activity-logs">
              <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white">
                View Activity Logs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 shadow-lg dark:border-emerald-900 dark:shadow-none">
          <CardHeader className="border-b border-emerald-100 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 to-white dark:from-slate-900 dark:to-emerald-950">
            <CardTitle className="text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Support
            </CardTitle>
            <CardDescription>Sailor assistance</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-4 text-emerald-700 dark:text-emerald-300">
              Review and respond to sailor support requests and concerns.
            </p>
            <Link href="/admin/support">
              <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white">
                Manage Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
