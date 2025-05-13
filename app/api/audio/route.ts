import { type NextRequest, NextResponse } from "next/server"
import { getAudioCollection } from "@/lib/mongodb-server"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/audio - Starting request")

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log("POST /api/audio - Request body parsed:", body)
    } catch (e) {
      console.error("POST /api/audio - Error parsing request body:", e)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { publicId, url, resourceType, format, duration, title, thumbnailUrl } = body

    if (!publicId || !url) {
      console.error("POST /api/audio - Missing required fields:", { publicId, url })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get audio collection
    console.log("POST /api/audio - Getting audio collection")
    const collection = await getAudioCollection()

    // Store audio metadata in MongoDB
    console.log("POST /api/audio - Inserting audio metadata")
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

    console.log("POST /api/audio - Audio metadata inserted successfully:", result.insertedId.toString())
    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("POST /api/audio - Error saving audio metadata:", error)
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
    console.log("GET /api/audio - Starting request")

    // Get audio collection
    console.log("GET /api/audio - Getting audio collection")
    const collection = await getAudioCollection()

    // Get all audio files, sorted by creation date (newest first)
    console.log("GET /api/audio - Fetching audio files")
    const audioFiles = await collection.find({}).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    console.log(`GET /api/audio - Found ${audioFiles.length} audio files`)
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
    console.error("GET /api/audio - Error fetching audio files:", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([])
  }
}

// Update audio with thumbnail
export async function PUT(request: NextRequest) {
  try {
    console.log("PUT /api/audio - Starting request")

    // Parse request body
    let body
    try {
      body = await request.json()
      console.log("PUT /api/audio - Request body parsed:", body)
    } catch (e) {
      console.error("PUT /api/audio - Error parsing request body:", e)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { id, thumbnailUrl } = body

    if (!id) {
      console.error("PUT /api/audio - Missing audio ID")
      return NextResponse.json({ error: "Missing audio ID" }, { status: 400 })
    }

    // Get audio collection
    console.log("PUT /api/audio - Getting audio collection")
    const collection = await getAudioCollection()

    // Update the audio document with the thumbnail URL
    console.log(`PUT /api/audio - Updating audio ${id} with thumbnail`)
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: { thumbnailUrl } })

    console.log("PUT /api/audio - Audio updated successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PUT /api/audio - Error updating audio metadata:", error)
    return NextResponse.json(
      {
        error: "Failed to update audio metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
