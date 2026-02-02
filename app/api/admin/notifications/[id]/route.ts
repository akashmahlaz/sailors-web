import { type NextRequest, NextResponse } from "next/server"
import { getAdminNotificationsCollection } from "@/lib/mongodb"
import { getServerSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: notificationId } = await params

    if (!ObjectId.isValid(notificationId)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 })
    }

    const adminNotificationsCollection = await getAdminNotificationsCollection()
    const notification = await adminNotificationsCollection.findOne({
      _id: new ObjectId(notificationId),
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error fetching notification:", error)
    return NextResponse.json({ error: "Failed to fetch notification" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: notificationId } = await params

    if (!ObjectId.isValid(notificationId)) {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 })
    }

    const adminNotificationsCollection = await getAdminNotificationsCollection()

    // Check if notification exists
    const existingNotification = await adminNotificationsCollection.findOne({
      _id: new ObjectId(notificationId),
    })

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Delete notification
    const result = await adminNotificationsCollection.deleteOne({
      _id: new ObjectId(notificationId),
    })

    return NextResponse.json({
      message: "Notification deleted successfully",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
