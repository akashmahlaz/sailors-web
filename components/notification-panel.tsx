"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Heart, MessageSquare, Share2, Info, Check } from "lucide-react"
import Link from "next/link"
import type { Notification } from "@/hooks/use-notifications"

interface NotificationPanelProps {
  notifications: Notification[]
}

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filteredNotifications = filter === "all" ? notifications : notifications.filter((n) => !n.read)

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "reply":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case "share":
        return <Share2 className="h-4 w-4 text-purple-500" />
      case "system":
        return <Info className="h-4 w-4 text-cyan-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return `${diffSec}s ago`
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHour < 24) return `${diffHour}h ago`
    if (diffDay < 7) return `${diffDay}d ago`

    return date.toLocaleDateString()
  }

  return (
    <Card className="absolute right-4 top-16 w-80 md:w-96 z-50 p-0 overflow-hidden shadow-xl border-cyan-200 dark:border-cyan-900">
      <div className="flex items-center justify-between p-4 border-b border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-cyan-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="font-medium text-cyan-900 dark:text-cyan-100">Notifications</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setFilter("unread")}>
            Unread
          </Button>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p>No {filter === "unread" ? "unread " : ""}notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-cyan-100 dark:divide-cyan-900">
            {filteredNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.link || "#"}
                className={`block p-4 hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors ${
                  !notification.read ? "bg-cyan-50/50 dark:bg-slate-800/50" : ""
                }`}
              >
                <div className="flex gap-3">
                  {notification.user ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.user.image || "/placeholder.svg"} />
                      <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 dark:text-slate-200">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(notification.timestamp)}</p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-cyan-600 dark:bg-cyan-500 self-start mt-1.5"></div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-white to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => {}}>
          <Check className="h-3 w-3 mr-1" /> Mark all as read
        </Button>
      </div>
    </Card>
  )
}
