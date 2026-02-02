import { type NextRequest, NextResponse } from "next/server"
import { getVideosCollection } from "@/lib/mongodb-server"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: videoId } = await params
    const { userId } = await request.json()

    if (!videoId || !ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const collection = await getVideosCollection()

    // Check if user already liked the video
    const video = await collection.findOne({
      _id: new ObjectId(videoId),
      "likes.userId": userId,
    })

    if (video) {
      // User already liked, so unlike
      await collection.updateOne(
        { _id: new ObjectId(videoId) },
        { $pull: { likes: { userId } } } as any
      )
      const updated = await collection.findOne({ _id: new ObjectId(videoId) })
      return NextResponse.json({ liked: false, likesCount: updated?.likes?.length || 0 })
    } else {
      // User hasn't liked, so add like
      await collection.updateOne(
        { _id: new ObjectId(videoId) },
        { $push: { likes: { userId, timestamp: new Date() } } } as any
      )
      const updated = await collection.findOne({ _id: new ObjectId(videoId) })
      return NextResponse.json({ liked: true, likesCount: updated?.likes?.length || 0 })
    }
  } catch (error) {
    console.error("Error updating like:", error)
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 })
  }
}
