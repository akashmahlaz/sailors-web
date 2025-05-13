import { type NextRequest, NextResponse } from "next/server"
import { getPhotosCollection } from "@/lib/mongodb-server"

export async function POST(request: NextRequest) {
  try {
    console.log("Photos API: POST request received")

    // Parse request body with extra error handling
    let body
    try {
      body = await request.json()
      console.log("Photos API: Request body parsed successfully")
    } catch (error) {
      console.error("Photos API: Failed to parse request body as JSON", error)
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    const { publicId, url, title, description, tags } = body

    if (!publicId || !url) {
      console.error("Photos API: Missing required fields", { publicId, url })
      return NextResponse.json({ error: "Missing required fields: publicId and url are required" }, { status: 400 })
    }

    // Get photos collection
    console.log("Photos API: Getting database collection")
    const collection = await getPhotosCollection()

    // Store photo metadata in MongoDB
    console.log("Photos API: Storing photo metadata", { publicId, title })
    const result = await collection.insertOne({
      publicId,
      url,
      title: title || publicId.split("/").pop(),
      description: description || "",
      tags: tags || [],
      createdAt: new Date(),
    })

    console.log("Photos API: Photo metadata stored successfully", { id: result.insertedId.toString() })
    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Photos API: Error processing request", error)
    return NextResponse.json(
      {
        error: "Failed to save photo metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("Photos API: GET request received")

    // Get photos collection
    const collection = await getPhotosCollection()

    // Get all photos, sorted by creation date (newest first)
    console.log("Photos API: Fetching photos from database")
    const photos = await collection.find({}).sort({ createdAt: -1 }).toArray()
    console.log(`Photos API: Found ${photos.length} photos`)

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
    console.error("Photos API: Error fetching photos", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([])
  }
}
