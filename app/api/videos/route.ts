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

    if (!userId) {
      console.error("POST /api/videos - Missing user ID")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
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
      userId,
      userName: userName || "Anonymous User",
      userImage: userImage || null,
      views: 0,
      likes: [], // Always initialize as an array for new videos
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

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/videos - Starting request")

    const userId = request.nextUrl.searchParams.get("userId")
    console.log("GET /api/videos - User ID:", userId)

    // Get videos collection
    console.log("GET /api/videos - Getting videos collection")
    const collection = await getVideosCollection()

    // Build query based on userId
    let query = {}
    if (userId) {
      query = { userId }
    }
    console.log("GET /api/videos - Query:", query)

    // Get videos, sorted by creation date (newest first)
    console.log("GET /api/videos - Fetching videos")
    const videos = await collection.find(query).sort({ createdAt: -1 }).toArray()
    console.log(`GET /api/videos - Found ${videos.length} videos`)

    // Transform MongoDB _id to id for client-side compatibility
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
      likes: Array.isArray(video.likes) ? video.likes : [],
      comments: video.comments || [],
      created_at: video.createdAt.toISOString(),
    }))

    console.log("GET /api/videos - Returning formatted videos")
    return NextResponse.json({ videos: formattedVideos })
  } catch (error) {
    console.error("GET /api/videos - Error fetching videos:", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json({ videos: [] })
  }
}
