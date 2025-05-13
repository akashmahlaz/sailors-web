import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Helper function to get the photos collection
async function getPhotosCollection() {
  const client = await clientPromise
  const db = client.db("cloudinary_media")
  return db.collection("photos")
}

export async function POST(request: NextRequest) {
  try {
    const { publicId, url, title, description, tags } = await request.json()

    if (!publicId || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get photos collection
    const collection = await getPhotosCollection()

    // Store photo metadata in MongoDB
    const result = await collection.insertOne({
      publicId,
      url,
      title: title || publicId.split("/").pop(),
      description: description || "",
      tags: tags || [],
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error saving photo metadata:", error)
    return NextResponse.json(
      {
        error: "Failed to save photo metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Get photos collection
    const collection = await getPhotosCollection()

    // Get all photos, sorted by creation date (newest first)
    const photos = await collection.find({}).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedPhotos = photos.map((photo) => ({
      id: photo._id.toString(),
      public_id: photo.publicId,
      url: photo.url,
      title: photo.title,
      description: photo.description,
      tags: photo.tags,
      created_at: photo.createdAt.toISOString(),
    }))

    return NextResponse.json(formattedPhotos)
  } catch (error) {
    console.error("Error fetching photos:", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([])
  }
}
