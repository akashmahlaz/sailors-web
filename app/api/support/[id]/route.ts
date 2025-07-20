import { type NextRequest, NextResponse } from "next/server"
import { getSupportRequestsCollection } from "@/lib/support-requests"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const id = params.id

    // Get support requests collection
    const collection = await getSupportRequestsCollection()

    // Find the support request by ID
    const supportRequest = await collection.findOne({ _id: new ObjectId(id) })

    if (!supportRequest) {
      return NextResponse.json({ error: "Support request not found" }, { status: 404 })
    }

    // Check if user is authorized to view this request
    // Admins can view all, users can only view their own non-anonymous requests
    if (
      session?.user?.role !== "admin" &&
      (supportRequest.isAnonymous || supportRequest.submitterId !== session?.user?.id)
    ) {
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
      proofs: supportRequest.proofs,
      createdAt: supportRequest.createdAt.toISOString(),
      updatedAt: supportRequest.updatedAt.toISOString(),
      adminNotes: supportRequest.adminNotes,
      adminId: supportRequest.adminId,
      resolution: supportRequest.resolution,
    }

    return NextResponse.json(formattedRequest)
  } catch (error) {
    console.error("Error fetching support request:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch support request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can update support requests
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const id = params.id
    const { status, adminNotes, resolution } = await request.json()

    // Get support requests collection
    const collection = await getSupportRequestsCollection()

    // Update the support request
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          adminNotes,
          resolution,
          adminId: session.user.id,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Support request not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating support request:", error)
    return NextResponse.json(
      {
        error: "Failed to update support request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
