"use client"

import { useState, useEffect } from "react"

export interface Notification {
  id: string
  type: "like" | "comment" | "reply" | "share" | "system"
  message: string
  timestamp: Date
  read: boolean
  link?: string
  user?: {
    name: string
    image?: string
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false)

  // Mock notifications for demonstration
  useEffect(() => {
    // In a real app, you would fetch notifications from an API
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "like",
        message: "Captain Morgan liked your sea shanty",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        link: "/audio",
        user: {
          name: "Captain Morgan",
          image: "/diverse-avatars.png",
        },
      },
      {
        id: "2",
        type: "comment",
        message: "First Mate Jones commented on your maritime photo",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        link: "/photos",
        user: {
          name: "First Mate Jones",
          image: "/diverse-group-avatars.png",
        },
      },
      {
        id: "3",
        type: "reply",
        message: "Sailor Smith replied to your comment on 'Voyage to the North'",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        link: "/blog/1",
        user: {
          name: "Sailor Smith",
          image: "/diverse-avatars.png",
        },
      },
      {
        id: "4",
        type: "share",
        message: "Captain Morgan shared your sea story with their crew",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        link: "/blog",
        user: {
          name: "Captain Morgan",
          image: "/diverse-avatars.png",
        },
      },
      {
        id: "5",
        type: "system",
        message: "Welcome aboard! Complete your sailor profile to get started.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        read: true,
        link: "/dashboard",
      },
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter((n) => !n.read).length)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.id === id && !notification.read) {
          setUnreadCount((count) => count - 1)
          return { ...notification, read: true }
        }
        return notification
      }),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
    setUnreadCount(0)
  }

  const toggleNotificationPanel = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen)
  }

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      read: false,
      ...notification,
    }

    setNotifications((prev) => [newNotification, ...prev])
    setUnreadCount((count) => count + 1)
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    isNotificationPanelOpen,
    toggleNotificationPanel,
  }
}
