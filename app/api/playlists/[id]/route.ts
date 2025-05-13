import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Helper function to get the playlists collection
async function getPlaylistsCollection() {
  const client = await clientPromise
  const db = client.db("cloudinary_media")
  return db.collection("playlists")
}

// Get a specific playlist
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = await params.id

    // Get playlists collection
    const collection = await getPlaylistsCollection()

    // Find the playlist by ID
    const playlist = await collection.findOne({ _id: new ObjectId(id) })

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    // Transform MongoDB _id to id for client-side compatibility
    const formattedPlaylist = {
      id: playlist._id.toString(),
      name: playlist.name,
      description: playlist.description,
      audio_ids: playlist.audioIds,
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

// Update a playlist
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { name, description, audioIds, addAudioId, removeAudioId } = await request.json()

    // Get playlists collection
    const collection = await getPlaylistsCollection()

    // Find the playlist by ID
    const playlist = await collection.findOne({ _id: new ObjectId(id) })

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (name !== undefined) {
      updateData.name = name
    }

    if (description !== undefined) {
      updateData.description = description
    }

    if (audioIds !== undefined) {
      updateData.audioIds = audioIds
    }

    // If we're adding a single audio ID
    if (addAudioId) {
      const currentAudioIds = playlist.audioIds || []
      if (!currentAudioIds.includes(addAudioId)) {
        await collection.updateOne(
          { _id: new ObjectId(id) },
          { $push: { audioIds: addAudioId }, $set: { updatedAt: new Date() } },
        )
      }
    }

    // If we're removing a single audio ID
    if (removeAudioId) {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { audioIds: removeAudioId }, $set: { updatedAt: new Date() } },
      )
    }

    // Only update if we have fields other than just updatedAt
    if (Object.keys(updateData).length > 1) {
      await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })
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

// Delete a playlist
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

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
