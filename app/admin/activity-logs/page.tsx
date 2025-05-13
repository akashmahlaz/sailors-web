"use client"

import { Suspense } from "react"
import { ActivityLogs } from "@/components/admin/activity-logs"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useEffect } from "react"

export default function AdminActivityLogsPage() {
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
    <div className="container mx-auto px-4 py-8">
      <AdminPageHeader
        title="Activity Logs"
        description="Track all administrative actions for accountability and auditing"
      />

      <Suspense fallback={<div>Loading activity logs...</div>}>
        <ActivityLogs />
      </Suspense>
    </div>
  )
}
