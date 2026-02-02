import { type NextRequest, NextResponse } from "next/server"
import { getSupportRequestsCollection } from "@/lib/mongodb-server"
import { getServerSession } from "@/lib/auth"
import { sendSupportRequestEmails } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    const { title, description, category, isAnonymous, proofs } = await request.json()

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category are required" }, { status: 400 })
    }

    // Get support requests collection
    const collection = await getSupportRequestsCollection()

    // Create support request object
    const supportRequest = {
      title,
      description,
      category,
      isAnonymous,
      submitterId: isAnonymous ? null : session?.user?.id,
      submitterName: isAnonymous ? null : session?.user?.name,
      submitterEmail: isAnonymous ? null : session?.user?.email,
      status: "pending",
      proofs: proofs || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Store support request in MongoDB
    const result = await collection.insertOne(supportRequest)
    const requestId = result.insertedId.toString()

    try {
      await sendSupportRequestEmails({
        title,
        description,
        category,
        isAnonymous,
        submitterName: supportRequest.submitterName ?? undefined,
        submitterEmail: supportRequest.submitterEmail ?? undefined,
        submitterId: supportRequest.submitterId ?? undefined,
        proofs: proofs || [],
        requestId,
        createdAt: supportRequest.createdAt,
      })
    } catch (emailError) {
      console.error("Failed to send email notifications:", emailError)
    }

    return NextResponse.json({
      success: true,
      id: requestId,
    })
  } catch (error) {
    console.error("Error saving support request:", error)
    return NextResponse.json(
      {
        error: "Failed to save support request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Only admins can view all support requests
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get support requests collection
    const collection = await getSupportRequestsCollection()
    const url = new URL(request.url)

    // Get query parameters
    const status = url.searchParams.get("status")
    const category = url.searchParams.get("category")

    // Build query
    const query: Record<string, any> = {}
    if (status) {
      query.status = status
    }
    if (category) {
      query.category = category
    }

    // Get all support requests, sorted by creation date (newest first)
    const supportRequests = await collection.find(query).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedRequests = supportRequests.map((request) => ({
      id: request._id.toString(),
      title: request.title,
      description: request.description,
      category: request.category,
      isAnonymous: request.isAnonymous,
      submitterId: request.submitterId,
      submitterName: request.submitterName,
      submitterEmail: request.submitterEmail,
      status: request.status,
      proofs: request.proofs,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      adminNotes: request.adminNotes,
      adminId: request.adminId,
      resolution: request.resolution,
    }))

    return NextResponse.json(formattedRequests)
  } catch (error) {
    console.error("Error fetching support requests:", error)
    return NextResponse.json([])
  }
}
