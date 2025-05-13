import { type NextRequest, NextResponse } from "next/server"
import { getUserProfileByUserId } from "@/lib/user-profiles"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    const profile = await getUserProfileByUserId(userId)

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Remove sensitive information
    const { email, ...safeProfile } = profile

    return NextResponse.json(safeProfile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}
