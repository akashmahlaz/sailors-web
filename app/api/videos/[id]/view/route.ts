import { type NextRequest, NextResponse } from "next/server"
import { getVideosCollection } from "@/lib/mongodb-server"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: videoId } = await params

    if (!videoId || !ObjectId.isValid(videoId)) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 })
    }

    const collection = await getVideosCollection()

    // Increment the view count
    const result = await collection.updateOne({ _id: new ObjectId(videoId) }, { $inc: { views: 1 } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating view count:", error)
    return NextResponse.json({ error: "Failed to update view count" }, { status: 500 })
  }
}
