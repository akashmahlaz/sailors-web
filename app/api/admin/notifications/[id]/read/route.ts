import { type NextRequest, NextResponse } from "next/server"
import { getAdminNotificationsCollection } from "@/lib/mongodb"
import { getServerSession } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Mark notification as read
    const result = await adminNotificationsCollection.updateOne(
      { _id: new ObjectId(notificationId) },
      { $set: { isRead: true } },
    )

    return NextResponse.json({
      message: "Notification marked as read",
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
