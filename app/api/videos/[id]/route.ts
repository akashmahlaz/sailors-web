import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getVideosCollection } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get videos collection
    const collection = await getVideosCollection()

    // Find the video first to check ownership
    const video = await collection.findOne({ _id: new ObjectId(id) })
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Check if user owns the content or is an admin
    const isOwner = video.userId === session.user.id
    if (!isOwner && session.user.role !== 'admin') {
      return NextResponse.json({ error: "You don't have permission to delete this video" }, { status: 403 })
    }

    // Delete the video
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting video:", error)
    return NextResponse.json(
      { error: "Failed to delete video", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
} 