import { type NextRequest, NextResponse } from "next/server"
import { getAdminNotificationsCollection } from "@/lib/mongodb"
import { getServerSession } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminNotificationsCollection = await getAdminNotificationsCollection()

    // Mark all notifications as read
    const result = await adminNotificationsCollection.updateMany({ isRead: false }, { $set: { isRead: true } })

    return NextResponse.json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
  }
}
