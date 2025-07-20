import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getPhotosCollection } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get photos collection
    const collection = await getPhotosCollection()

    // Get all photos
    const photos = await collection.find({}).sort({ created_at: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedPhotos = photos.map((photo) => ({
      id: photo._id.toString(),
      ...photo,
      _id: undefined,
    }))

    return NextResponse.json(formattedPhotos)
  } catch (error) {
    console.error("Error fetching photos:", error)
    return NextResponse.json(
      { error: "Failed to fetch photos", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
