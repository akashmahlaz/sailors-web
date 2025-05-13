import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("cloudinary_videos")

    // Create a collection if it doesn't exist
    // (MongoDB creates collections automatically when documents are inserted,
    // but we can explicitly create it to verify connection)
    const collections = await db.listCollections({ name: "videos" }).toArray()

    if (collections.length === 0) {
      await db.createCollection("videos")
    }

    // Create an index on publicId for faster lookups and to ensure uniqueness
    await db.collection("videos").createIndex({ publicId: 1 }, { unique: true })

    return NextResponse.json({
      success: true,
      message: "MongoDB database initialized successfully",
    })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize MongoDB database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
