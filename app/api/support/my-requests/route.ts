import { type NextRequest, NextResponse } from "next/server"
import { getSupportRequestsCollection } from "@/lib/mongodb-server"
import { getServerSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const collection = await getSupportRequestsCollection()
    const url = new URL(request.url)

    const status = url.searchParams.get("status")
    const category = url.searchParams.get("category")
    const search = url.searchParams.get("search")

    const query: Record<string, any> = {
      $or: [
        { submitterId: session.user.id },
        { isAnonymous: false }
      ]
    }

    if (status) {
      query.status = status
    }
    if (category) {
      query.category = category
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    }

    const supportRequests = await collection.find(query).sort({ createdAt: -1 }).toArray()

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
    return NextResponse.json(
      { error: "Failed to fetch support requests" },
      { status: 500 }
    )
  }
}
