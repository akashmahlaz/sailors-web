import { type NextRequest, NextResponse } from "next/server"
import { getSupportRequestsCollection } from "@/lib/mongodb-server"
import { ObjectId } from "mongodb"
import { getServerSession } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const { id } = await params

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }

    const collection = await getSupportRequestsCollection()

    // Find the support request by ID
    const supportRequest = await collection.findOne({ _id: new ObjectId(id) })

    if (!supportRequest) {
      return NextResponse.json({ error: "Support request not found" }, { status: 404 })
    }

    // Users can only view their own non-anonymous requests
    if (supportRequest.isAnonymous || supportRequest.submitterId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Transform MongoDB _id to id for client-side compatibility
    const formattedRequest = {
      id: supportRequest._id.toString(),
      title: supportRequest.title,
      description: supportRequest.description,
      category: supportRequest.category,
      isAnonymous: supportRequest.isAnonymous,
      submitterId: supportRequest.submitterId,
      submitterName: supportRequest.submitterName,
      submitterEmail: supportRequest.submitterEmail,
      status: supportRequest.status,
      proofs: supportRequest.proofs || [],
      createdAt: supportRequest.createdAt instanceof Date 
        ? supportRequest.createdAt.toISOString() 
        : supportRequest.createdAt,
      updatedAt: supportRequest.updatedAt instanceof Date 
        ? supportRequest.updatedAt.toISOString() 
        : supportRequest.updatedAt,
      adminNotes: supportRequest.adminNotes,
      adminId: supportRequest.adminId,
      resolution: supportRequest.resolution,
      comments: supportRequest.comments || [],
    }

    return NextResponse.json(formattedRequest)
  } catch (error) {
    console.error("Error fetching support request:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch support request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Allow user to add a comment/reply to their own request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    const { id } = await params

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    // Users can only comment on their own non-anonymous requests
    if (supportRequest.isAnonymous || supportRequest.submitterId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Create new comment
    const newComment = {
      id: new ObjectId().toString(),
      message: message.trim(),
      authorId: session.user.id,
      authorName: session.user.name || "User",
      authorRole: "user",
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

    return NextResponse.json({ 
      success: true, 
      comment: {
        ...newComment,
        createdAt: newComment.createdAt.toISOString(),
      }
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
