import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb-server"

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    const client = await clientPromise

    // Target database
    const db = client.db("sailor_platform")

    // Collections to create
    const collections = [
      "videos",
      "audio",
      "playlists",
      "photos",
      "blogs",
      "news",
      "podcasts",
      "podcast_episodes",
      "users",
      "user_profiles",
      "follows",
      "support_requests",
      "support_templates",
      "knowledge_base",
      "admin_activity_logs",
      "admin_notifications",
    ]

    // Create each collection
    const results = []

    for (const name of collections) {
      try {
        await db.createCollection(name)
        results.push({
          collection: name,
          status: "created",
        })
      } catch (error) {
        // Collection might already exist
        results.push({
          collection: name,
          status: "exists",
        })
      }
    }

    // Create indexes for better performance
    await db.collection("videos").createIndex({ createdAt: -1 })
    await db.collection("audio").createIndex({ createdAt: -1 })
    await db.collection("playlists").createIndex({ createdAt: -1 })
    await db.collection("photos").createIndex({ createdAt: -1 })
    await db.collection("blogs").createIndex({ createdAt: -1 })
    await db.collection("news").createIndex({ publishedAt: -1 })
    await db.collection("podcasts").createIndex({ createdAt: -1 })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("user_profiles").createIndex({ userId: 1 }, { unique: true })
    await db.collection("follows").createIndex({ followerId: 1, followingId: 1 }, { unique: true })
    await db.collection("support_requests").createIndex({ createdAt: -1 })
    await db.collection("admin_activity_logs").createIndex({ timestamp: -1 })
    await db.collection("admin_notifications").createIndex({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      message: "Database initialization completed",
      results,
    })
  } catch (error) {
    console.error("Initialization error:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
