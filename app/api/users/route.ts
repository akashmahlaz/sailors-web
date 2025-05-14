import { type NextRequest, NextResponse } from "next/server"
import { getUserProfilesCollection } from "@/lib/mongodb"

// GET /api/users?limit=6
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "6")

    const collection = await getUserProfilesCollection()
    // You can add more logic here to select only featured users if needed
    const users = await collection.find({}).sort({ joinedAt: -1 }).limit(limit).toArray()

    // Remove sensitive info
    const sanitized = users.map(({ email, ...rest }) => rest)

    return NextResponse.json(sanitized)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
