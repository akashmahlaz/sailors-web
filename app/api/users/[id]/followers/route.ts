import { type NextRequest, NextResponse } from "next/server"
import { getFollowers } from "@/lib/user-profiles"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    const followers = await getFollowers(userId)

    // Remove sensitive information
    const safeFollowers = followers.map(({ email, ...rest }) => rest)

    return NextResponse.json(safeFollowers)
  } catch (error) {
    console.error("Error fetching followers:", error)
    return NextResponse.json({ error: "Failed to fetch followers" }, { status: 500 })
  }
}
