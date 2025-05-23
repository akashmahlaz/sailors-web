import { type NextRequest, NextResponse } from "next/server"
import { getBlogsCollection } from "@/lib/mongodb-server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, coverImageUrl, author, tags } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Get blogs collection
    const collection = await getBlogsCollection()

    // Store blog post in MongoDB
    const result = await collection.insertOne({
      title,
      content,
      coverImageUrl: coverImageUrl || null,
      author: author || "Anonymous",
      author_id: session.user.id, // Store the author's ID
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error saving blog post:", error)
    return NextResponse.json(
      {
        error: "Failed to save blog post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Get blogs collection
    const collection = await getBlogsCollection()

    // Get all blog posts, sorted by creation date (newest first)
    const blogs = await collection.find({}).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedBlogs = blogs.map((blog) => ({
      id: blog._id.toString(),
      title: blog.title,
      content: blog.content,
      cover_image_url: blog.coverImageUrl,
      author: blog.author,
      author_id: blog.author_id,
      tags: blog.tags,
      created_at: blog.createdAt.toISOString(),
      updated_at: blog.updatedAt.toISOString(),
    }))

    return NextResponse.json(formattedBlogs)
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([])
  }
}
