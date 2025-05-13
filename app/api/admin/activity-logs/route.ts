import { type NextRequest, NextResponse } from "next/server"
import { getAdminActivityLogsCollection } from "@/lib/mongodb-server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const action = searchParams.get("action") || ""
    const target = searchParams.get("target") || ""
    const adminId = searchParams.get("adminId") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

    const query: any = {}

    if (action) {
      query.action = action
    }

    if (target) {
      query.target = target
    }

    if (adminId) {
      query.adminId = adminId
    }

    if (startDate || endDate) {
      query.createdAt = {}

      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }

      if (endDate) {
        query.createdAt.$lte = new Date(endDate)
      }
    }

    const adminActivityLogsCollection = await getAdminActivityLogsCollection()

    const [logs, totalCount] = await Promise.all([
      adminActivityLogsCollection
        .find(query)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      adminActivityLogsCollection.countDocuments(query),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 })
  }
}
