import { getCollection, getAdminNotificationsCollection } from "./mongodb-server"
import { ObjectId } from "mongodb"

export interface AdminNotification {
  title: string
  message: string
  type: string
  priority: "info" | "warning" | "critical" | "success"
  createdBy: string
}

type AdminNotificationData = {
  title: string
  message: string
  type: string
  priority: string
  createdBy?: string
  link?: string
}

export async function createAdminNotification(data: AdminNotificationData) {
  try {
    const collection = await getAdminNotificationsCollection()

    await collection.insertOne({
      title: data.title,
      message: data.message,
      type: data.type,
      priority: data.priority,
      createdBy: data.createdBy,
      link: data.link,
      isRead: false,
      createdAt: new Date(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error creating admin notification:", error)
    return { success: false, error }
  }
}

export async function getAdminNotifications(query: Record<string, any> = {}, limit = 100) {
  try {
    const collection = await getCollection("admin_notifications")

    // Get notifications sorted by creation date (newest first)
    const notifications = await collection.find(query).sort({ createdAt: -1 }).limit(limit).toArray()

    return notifications.map((notification) => ({
      id: notification._id.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      read: notification.read || false,
      createdAt: notification.createdAt.toISOString(),
      createdBy: notification.createdBy,
      readAt: notification.readAt ? notification.readAt.toISOString() : null,
    }))
  } catch (error) {
    console.error("Error getting admin notifications:", error)
    return []
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const collection = await getCollection("admin_notifications")

    // Mark notification as read
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { read: true, readAt: new Date() } })

    return true
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const collection = await getCollection("admin_notifications")

    // Mark all notifications as read
    await collection.updateMany({ read: { $ne: true } }, { $set: { read: true, readAt: new Date() } })

    return true
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return false
  }
}

export async function deleteNotification(id: string) {
  try {
    const collection = await getCollection("admin_notifications")

    // Delete notification
    await collection.deleteOne({ _id: new ObjectId(id) })

    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    return false
  }
}

export async function getUnreadNotificationsCount() {
  try {
    const collection = await getAdminNotificationsCollection()

    const count = await collection.countDocuments({ isRead: false })

    return count
  } catch (error) {
    console.error("Error getting unread notifications count:", error)
    return 0
  }
}
