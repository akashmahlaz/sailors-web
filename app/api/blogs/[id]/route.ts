import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Helper function to get the blogs collection
async function getBlogsCollection() {
  const client = await clientPromise
  const db = client.db("cloudinary_media")
  return db.collection("blogs")
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get blogs collection
    const collection = await getBlogsCollection()

    // Find the blog post by ID
    const blog = await collection.findOne({ _id: new ObjectId(id) })

    if (!blog) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    // Transform MongoDB _id to id for client-side compatibility
    const formattedBlog = {
      id: blog._id.toString(),
      title: blog.title,
      content: blog.content,
      cover_image_url: blog.coverImageUrl,
      author: blog.author,
      tags: blog.tags,
      created_at: blog.createdAt.toISOString(),
      updated_at: blog.updatedAt.toISOString(),
    }

    return NextResponse.json(formattedBlog)
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch blog post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { title, content, coverImageUrl, author, tags } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Get blogs collection
    const collection = await getBlogsCollection()

    // Update the blog post
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          content,
          coverImageUrl,
          author,
          tags,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating blog post:", error)
    return NextResponse.json(
      {
        error: "Failed to update blog post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get blogs collection
    const collection = await getBlogsCollection()

    // Delete the blog post
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting blog post:", error)
    return NextResponse.json(
      {
        error: "Failed to delete blog post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
