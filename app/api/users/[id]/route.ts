import { type NextRequest, NextResponse } from "next/server"
import { getUserProfileByUserId } from "@/lib/user-profiles"

export async function GET(request: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  try {
    let params: { id: string };
    if (context.params instanceof Promise) {
      params = await context.params;
    } else {
      params = context.params;
    }
    const userId = params.id;

    const profile = await getUserProfileByUserId(userId)

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Return the full profile including email
    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}
