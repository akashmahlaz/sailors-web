import { type NextRequest, NextResponse } from "next/server"
import { getVideosCollection } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { publicId, url, resourceType } = await request.json()

    if (!publicId || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get videos collection
    const collection = await getVideosCollection()

    // Store video metadata in MongoDB
    const result = await collection.insertOne({
      publicId,
      url,
      resourceType: resourceType || "video",
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error saving video metadata:", error)
    return NextResponse.json(
      {
        error: "Failed to save video metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Get videos collection
    const collection = await getVideosCollection()

    // Get all videos, sorted by creation date (newest first)
    const videos = await collection.find({}).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedVideos = videos.map((video) => ({
      id: video._id.toString(),
      public_id: video.publicId,
      url: video.url,
      resource_type: video.resourceType,
      created_at: video.createdAt.toISOString(),
    }))

    return NextResponse.json(formattedVideos)
  } catch (error) {
    console.error("Error fetching videos:", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([])
  }
}
