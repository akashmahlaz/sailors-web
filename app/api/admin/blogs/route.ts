import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getBlogsCollection } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get blogs collection
    const collection = await getBlogsCollection()

    // Get all blogs
    const blogs = await collection.find({}).sort({ created_at: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedBlogs = blogs.map((blog) => ({
      id: blog._id.toString(),
      ...blog,
      _id: undefined,
    }))

    return NextResponse.json(formattedBlogs)
  } catch (error) {
    console.error("Error fetching blogs:", error)
    return NextResponse.json(
      { error: "Failed to fetch blogs", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
