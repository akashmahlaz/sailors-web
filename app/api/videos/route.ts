import { type NextRequest, NextResponse } from "next/server"
import { getVideosCollection } from "@/lib/mongodb-server"

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/videos - Starting request")

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log("POST /api/videos - Request body parsed:", body)
    } catch (e) {
      console.error("POST /api/videos - Error parsing request body:", e)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const {
      publicId,
      url,
      resourceType,
      title,
      description,
      thumbnailPublicId,
      thumbnailUrl,
      userId,
      userName,
      userImage,
    } = body

    if (!publicId || !url) {
      console.error("POST /api/videos - Missing required fields:", { publicId, url })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get videos collection
    console.log("POST /api/videos - Getting videos collection")
    const collection = await getVideosCollection()

    // Store video metadata in MongoDB
    console.log("POST /api/videos - Inserting video metadata")
    const result = await collection.insertOne({
      publicId,
      url,
      resourceType: resourceType || "video",
      title: title || "Untitled Video",
      description: description || "",
      thumbnailPublicId,
      thumbnailUrl,
      userId: userId || "anonymous",
      userName: userName || "Anonymous User",
      userImage: userImage || null,
      views: 0,
      likes: 0,
      comments: [],
      createdAt: new Date(),
    })

    console.log("POST /api/videos - Video metadata inserted successfully:", result.insertedId.toString())
    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("POST /api/videos - Error saving video metadata:", error)
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
    console.log("GET /api/videos - Starting request")

    // Get videos collection
    console.log("GET /api/videos - Getting videos collection")
    const collection = await getVideosCollection()

    // Get all videos, sorted by creation date (newest first)
    console.log("GET /api/videos - Fetching videos")
    const videos = await collection.find({}).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    console.log(`GET /api/videos - Found ${videos.length} videos`)
    const formattedVideos = videos.map((video) => ({
      id: video._id.toString(),
      public_id: video.publicId,
      url: video.url,
      title: video.title || "Untitled Video",
      description: video.description || "",
      thumbnail_url: video.thumbnailUrl || null,
      resource_type: video.resourceType,
      user_id: video.userId,
      user_name: video.userName,
      user_image: video.userImage,
      views: video.views || 0,
      likes: video.likes || 0,
      comments: video.comments || [],
      created_at: video.createdAt.toISOString(),
    }))

    return NextResponse.json(formattedVideos)
  } catch (error) {
    console.error("GET /api/videos - Error fetching videos:", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([])
  }
}
