import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getVideosCollection } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get videos collection
    const collection = await getVideosCollection()

    // Get all videos
    const videos = await collection.find({}).sort({ created_at: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedVideos = videos.map((video) => ({
      id: video._id.toString(),
      ...video,
      _id: undefined,
    }))

    return NextResponse.json(formattedVideos)
  } catch (error) {
    console.error("Error fetching videos:", error)
    return NextResponse.json(
      { error: "Failed to fetch videos", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
