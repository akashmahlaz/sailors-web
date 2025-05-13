"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, LifeBuoy, Users } from "lucide-react"
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
      <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
        <CardHeader className="border-b border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-cyan-50 to-white dark:from-slate-900 dark:to-cyan-950">
          <CardTitle className="text-cyan-900 dark:text-cyan-100">Captain's Controls</CardTitle>
          <CardDescription>Command your fleet from here</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <p className="text-cyan-700 dark:text-cyan-300">
              Welcome to the captain's quarters. Here you can manage your crew and fleet settings.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-cyan-200 dark:border-cyan-900">
                <CardHeader>
                  <CardTitle className="text-cyan-800 dark:text-cyan-200 flex items-center gap-2">
                    <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    Crew Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-cyan-700 dark:text-cyan-300">Manage crew accounts, roles, and permissions.</p>
                  <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
                    Manage Crew
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-cyan-200 dark:border-cyan-900">
                <CardHeader>
                  <CardTitle className="text-cyan-800 dark:text-cyan-200 flex items-center gap-2">
                    <LifeBuoy className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    Sailor Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-cyan-700 dark:text-cyan-300">
                    Review and respond to sailor support requests and concerns.
                  </p>
                  <Link href="/admin/support">
                    <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
                      Manage Support Requests
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
