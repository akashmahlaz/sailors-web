import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth"
import { getPhotosCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if user is authenticated and is an admin
    const session = await getServerSession()
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get photos collection
    const collection = await getPhotosCollection()

    // Delete the photo
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting photo:", error)
    return NextResponse.json(
      { error: "Failed to delete photo", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
