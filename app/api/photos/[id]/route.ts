import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getPhotosCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get photos collection
    const collection = await getPhotosCollection()

    // Find the photo first to check ownership
    const photo = await collection.findOne({ _id: new ObjectId(id) })
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // Check if user owns the content or is an admin
    const isOwner = photo.userId === session.user.id
    if (!isOwner && session.user.role !== 'admin') {
      return NextResponse.json({ error: "You don't have permission to delete this photo" }, { status: 403 })
    }

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