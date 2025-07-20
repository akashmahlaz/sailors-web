import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

// Helper function to get the podcasts collection
async function getPodcastsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("podcasts")
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Podcast ID is required" }, { status: 400 })
    }

    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get podcasts collection
    const collection = await getPodcastsCollection()

    // Delete the podcast
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting podcast:", error)
    return NextResponse.json(
      {
        error: "Failed to delete podcast",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
