"use client"

import { Suspense } from "react"
import { AdminNotifications } from "@/components/admin/admin-notifications"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface AdminNotification {
  _id: string
  title: string
  message: string
  type: "info" | "warning" | "critical" | "success"
  isRead: boolean
  createdAt: string
  link?: string
  source: string
}

export default function AdminNotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<AdminNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [readFilter, setReadFilter] = useState("all")
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    contentReports: true,
    newUsers: true,
    systemAlerts: true,
    supportRequests: true,
  })

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  // Fetch notifications
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchNotifications()
    }
  }, [status, session])

  // Apply filters
  useEffect(() => {
    if (notifications.length > 0) {
      let filtered = [...notifications]

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(
          (notification) =>
            notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      // Apply type filter
      if (typeFilter !== "all") {
        filtered = filtered.filter((notification) => notification.type === typeFilter)
      }

      // Apply read filter
      if (readFilter !== "all") {
        const isRead = readFilter === "read"
        filtered = filtered.filter((notification) => notification.isRead === isRead)
      }

      setFilteredNotifications(filtered)
    }
  }, [notifications, searchQuery, typeFilter, readFilter])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/notifications")
      if (!response.ok) throw new Error("Failed to fetch notifications")
      const data = await response.json()
      setNotifications(data.notifications)
      setFilteredNotifications(data.notifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
        method: "PATCH",
      })

      if (!response.ok) throw new Error("Failed to mark notification as read")

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification._id === id ? { ...notification, isRead: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete notification")

      // Update local state
      setNotifications(notifications.filter((notification) => notification._id !== id))
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/admin/notifications/mark-all-read", {
        method: "PATCH",
      })

      if (!response.ok) throw new Error("Failed to mark all notifications as read")

      // Update local state
      setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const saveNotificationSettings = async () => {
    try {
      const response = await fetch("/api/admin/notification-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationSettings),
      })

      if (!response.ok) throw new Error("Failed to save notification settings")

      // Show success message or update UI as needed
    } catch (error) {
      console.error("Error saving notification settings:", error)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "info":
        return <Badge className="bg-blue-500">Info</Badge>
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>
      case "critical":
        return <Badge className="bg-red-500">Critical</Badge>
      case "success":
        return <Badge className="bg-green-500">Success</Badge>
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "MMM d, yyyy 'at' h:mm a")
  }

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
      <AdminPageHeader title="Notifications" description="Manage system notifications and alerts for administrators" />

      <Suspense fallback={<div>Loading notifications...</div>}>
        <AdminNotifications />
      </Suspense>
    </div>
  )
}
