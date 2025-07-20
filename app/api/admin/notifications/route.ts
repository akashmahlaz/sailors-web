import { type NextRequest, NextResponse } from "next/server"
import { getAdminNotificationsCollection } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const type = searchParams.get("type") || ""
    const category = searchParams.get("category") || ""
    const isRead = searchParams.get("isRead")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    const query: any = {}

    if (type) {
      query.type = type
    }

    if (category) {
      query.category = category
    }

    if (isRead !== null) {
      query.isRead = isRead === "true"
    }

    const adminNotificationsCollection = await getAdminNotificationsCollection()

    const [notifications, totalCount] = await Promise.all([
      adminNotificationsCollection
        .find(query)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      adminNotificationsCollection.countDocuments(query),
    ])

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notificationData = await request.json()

    // Validate required fields
    if (!notificationData.title || !notificationData.message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    const adminNotificationsCollection = await getAdminNotificationsCollection()

    // Create new notification
    const newNotification = {
      ...notificationData,
      isRead: false,
      createdAt: new Date(),
      type: notificationData.type || "info",
      category: notificationData.category || "system",
    }

    const result = await adminNotificationsCollection.insertOne(newNotification)

    return NextResponse.json(
      {
        message: "Notification created successfully",
        notificationId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
