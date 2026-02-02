import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { followUser, unfollowUser, isFollowing } from "@/lib/user-profiles"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const followerId = session.user.id
    const { id: followingId } = await params

    // Can't follow yourself
    if (followerId === followingId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    const result = await followUser(followerId, followingId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error following user:", error)
    return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const followerId = session.user.id
    const { id: followingId } = await params

    const result = await unfollowUser(followerId, followingId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const followerId = session.user.id
    const { id: followingId } = await params

    const following = await isFollowing(followerId, followingId)

    return NextResponse.json({ following })
  } catch (error) {
    console.error("Error checking follow status:", error)
    return NextResponse.json({ error: "Failed to check follow status" }, { status: 500 })
  }
}
