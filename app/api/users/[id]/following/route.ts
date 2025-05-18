import { NextRequest, NextResponse } from "next/server"
import { getFollowing } from "@/lib/user-profiles"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const userId = resolvedParams.id

    const following = await getFollowing(userId)

    // Remove sensitive information
    const safeFollowing = following.map(({ email, ...rest }) => rest)

    return NextResponse.json(safeFollowing)
  } catch (error) {
    console.error("Error fetching following:", error)
    return NextResponse.json(
      { error: "Failed to fetch following" },
      { status: 500 }
    )
  }
}
