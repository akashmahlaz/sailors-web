import { type NextRequest, NextResponse } from "next/server"
import { getPlaylistsCollection } from "@/lib/mongodb-server"

export async function POST(request: NextRequest) {
  try {
    const { title, description, isPublic, videoIds, userId, userName, userImage } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Playlist title is required" }, { status: 400 })
    }

    if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
      return NextResponse.json({ error: "At least one video is required" }, { status: 400 })
    }

    // Get playlists collection
    const collection = await getPlaylistsCollection()

    // Store playlist in MongoDB
    const result = await collection.insertOne({
      title,
      description: description || "",
      isPublic: isPublic !== false, // Default to true
      videoIds,
      userId: userId || "anonymous",
      userName: userName || "Anonymous User",
      userImage: userImage || null,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error creating playlist:", error)
    return NextResponse.json(
      {
        error: "Failed to create playlist",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    // Get playlists collection
    const collection = await getPlaylistsCollection()

    // Build query
    const query: any = {}
    if (userId) {
      query.userId = userId
    } else {
      // If no userId specified, only return public playlists
      query.isPublic = true
    }

    // Get playlists, sorted by creation date (newest first)
    const playlists = await collection.find(query).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedPlaylists = playlists.map((playlist) => ({
      id: playlist._id.toString(),
      title: playlist.title,
      description: playlist.description,
      isPublic: playlist.isPublic,
      videoIds: playlist.videoIds,
      userId: playlist.userId,
      userName: playlist.userName,
      userImage: playlist.userImage,
      views: playlist.views || 0,
      created_at: playlist.createdAt.toISOString(),
      updated_at: playlist.updatedAt.toISOString(),
    }))

    return NextResponse.json(formattedPlaylists)
  } catch (error) {
    console.error("Error fetching playlists:", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([])
  }
}
