import { type NextRequest, NextResponse } from "next/server"
import { getPlaylistsCollection } from "@/lib/mongodb-server"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 })
    }

    // Get playlists collection
    const collection = await getPlaylistsCollection()

    // Find the playlist by ID
    const playlist = await collection.findOne({ _id: new ObjectId(id) })

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    // Format the response
    const formattedPlaylist = {
      id: playlist._id.toString(),
      title: playlist.title,
      description: playlist.description,
      isPublic: playlist.isPublic,
      videoIds: playlist.videoIds,
      userId: playlist.userId,
      userName: playlist.userName,
      userImage: playlist.userImage,
      created_at: playlist.createdAt.toISOString(),
      updated_at: playlist.updatedAt.toISOString(),
    }

    return NextResponse.json(formattedPlaylist)
  } catch (error) {
    console.error("Error fetching playlist:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch playlist",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 })
    }

    const { title, description, isPublic, videoIds } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Playlist title is required" }, { status: 400 })
    }

    // Get playlists collection
    const collection = await getPlaylistsCollection()

    // Update the playlist
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          description,
          isPublic,
          videoIds,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating playlist:", error)
    return NextResponse.json(
      {
        error: "Failed to update playlist",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 })
    }

    // Get playlists collection
    const collection = await getPlaylistsCollection()

    // Delete the playlist
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting playlist:", error)
    return NextResponse.json(
      {
        error: "Failed to delete playlist",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
