import { type NextRequest, NextResponse } from "next/server"
import { getSupportRequestsCollection } from "@/lib/support-requests"
import { ObjectId } from "mongodb"
import { getServerSession } from "@/lib/auth"
import { sendStatusUpdateEmail } from "@/lib/email"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const { id } = await params

    // Only admins can add comments
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }

    const { message } = await request.json()

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const collection = await getSupportRequestsCollection()

    // Find the support request
    const supportRequest = await collection.findOne({ _id: new ObjectId(id) })

    if (!supportRequest) {
      return NextResponse.json({ error: "Support request not found" }, { status: 404 })
    }

    // Create new comment
    const newComment = {
      id: new ObjectId().toString(),
      message: message.trim(),
      authorId: session.user.id,
      authorName: session.user.name || "Admin",
      authorRole: "admin",
      createdAt: new Date(),
    }

    // Add comment to request
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { comments: newComment } as any,
        $set: { updatedAt: new Date() },
      }
    )

    // Send email notification to the submitter if not anonymous
    if (!supportRequest.isAnonymous && supportRequest.submitterEmail) {
      try {
        await sendStatusUpdateEmail({
          recipientEmail: supportRequest.submitterEmail,
          recipientName: supportRequest.submitterName || "User",
          requestId: id,
          requestTitle: supportRequest.title,
          newStatus: supportRequest.status,
          adminMessage: message.trim(),
          type: "comment",
        })
      } catch (emailError) {
        console.error("Failed to send comment notification email:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      comment: {
        ...newComment,
        createdAt: newComment.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json(
      {
        error: "Failed to add comment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }

    const collection = await getSupportRequestsCollection()
    const supportRequest = await collection.findOne({ _id: new ObjectId(id) })

    if (!supportRequest) {
      return NextResponse.json({ error: "Support request not found" }, { status: 404 })
    }

    // Check authorization
    const isAdmin = session.user?.role === "admin"
    const isOwner = supportRequest.submitterId === session.user?.id && !supportRequest.isAnonymous

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const comments = (supportRequest.comments || []).map((comment: any) => ({
      ...comment,
      createdAt: comment.createdAt instanceof Date
        ? comment.createdAt.toISOString()
        : comment.createdAt,
    }))

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch comments",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
