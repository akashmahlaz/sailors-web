import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Helper function to get the audio collection
async function getAudioCollection() {
  const client = await clientPromise
  const db = client.db("cloudinary_media")
  return db.collection("audio")
}

// Helper function to get the playlists collection
async function getPlaylistsCollection() {
  const client = await clientPromise
  const db = client.db("cloudinary_media")
  return db.collection("playlists")
}

export async function POST(request: NextRequest) {
  try {
    const { publicId, url, resourceType, format, duration, title, thumbnailUrl } = await request.json()

    if (!publicId || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get audio collection
    const collection = await getAudioCollection()

    // Store audio metadata in MongoDB
    const result = await collection.insertOne({
      publicId,
      url,
      resourceType: resourceType || "audio",
      format: format || "mp3",
      duration: duration || 0,
      title: title || publicId.split("/").pop(),
      thumbnailUrl: thumbnailUrl || null,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error saving audio metadata:", error)
    return NextResponse.json(
      {
        error: "Failed to save audio metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Get audio collection
    const collection = await getAudioCollection()

    // Get all audio files, sorted by creation date (newest first)
    const audioFiles = await collection.find({}).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedAudioFiles = audioFiles.map((audio) => ({
      id: audio._id.toString(),
      public_id: audio.publicId,
      url: audio.url,
      resource_type: audio.resourceType,
      format: audio.format,
      duration: audio.duration,
      title: audio.title,
      thumbnail_url: audio.thumbnailUrl,
      created_at: audio.createdAt.toISOString(),
    }))

    return NextResponse.json(formattedAudioFiles)
  } catch (error) {
    console.error("Error fetching audio files:", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([])
  }
}

// Update audio with thumbnail
export async function PUT(request: NextRequest) {
  try {
    const { id, thumbnailUrl } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Missing audio ID" }, { status: 400 })
    }

    // Get audio collection
    const collection = await getAudioCollection()

    // Update the audio document with the thumbnail URL
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { thumbnailUrl } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating audio metadata:", error)
    return NextResponse.json(
      {
        error: "Failed to update audio metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
