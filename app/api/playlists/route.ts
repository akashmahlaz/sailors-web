import { type NextRequest, NextResponse } from "next/server"
import { getPlaylistsCollection } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { name, description, audioIds } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Playlist name is required" }, { status: 400 })
    }

    // Get playlists collection
    const collection = await getPlaylistsCollection()

    // Store playlist in MongoDB
    const result = await collection.insertOne({
      name,
      description: description || "",
      audioIds: audioIds || [],
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

export async function GET() {
  try {
    // Get playlists collection
    const collection = await getPlaylistsCollection()

    // Get all playlists, sorted by creation date (newest first)
    const playlists = await collection.find({}).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedPlaylists = playlists.map((playlist) => ({
      id: playlist._id.toString(),
      name: playlist.name,
      description: playlist.description,
      audio_ids: playlist.audioIds,
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
