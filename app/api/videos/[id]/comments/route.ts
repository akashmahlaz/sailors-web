import { type NextRequest, NextResponse } from "next/server"
import { getVideosCollection } from "@/lib/mongodb-server"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const videoId = params.id
    const { userId, userName, userImage, content } = await request.json()

    if (!videoId || !ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 })
    }

    if (!userId || !content) {
      return NextResponse.json({ error: "User ID and comment content are required" }, { status: 400 })
    }

    const collection = await getVideosCollection()

    const comment = {
      id: new ObjectId().toString(),
      userId,
      userName: userName || "Anonymous User",
      userImage,
      content,
      timestamp: new Date(),
      likes: 0,
    }

    await collection.updateOne({ _id: new ObjectId(videoId) }, { $push: { comments: comment } })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const videoId = params.id

    if (!videoId || !ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 })
    }

    const collection = await getVideosCollection()

    const video = await collection.findOne({ _id: new ObjectId(videoId) }, { projection: { comments: 1 } })

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(video.comments || [])
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}
