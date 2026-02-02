import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "@/lib/auth"

// Helper function to get the news collection
async function getNewsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("news")
}

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession()
  return session?.user?.role === "admin"
}

// Update the GET method to include media items in the response
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Get news collection
    const collection = await getNewsCollection()

    // Find the news article by ID
    const article = await collection.findOne({ _id: new ObjectId(id) })

    if (!article) {
      return NextResponse.json({ error: "News article not found" }, { status: 404 })
    }

    // Increment view count
    await collection.updateOne({ _id: new ObjectId(id) }, { $inc: { views: 1 } })

    // Transform MongoDB _id to id for client-side compatibility
    const formattedArticle = {
      id: article._id.toString(),
      title: article.title,
      summary: article.summary,
      content: article.content,
      cover_image_url: article.coverImageUrl,
      author: article.author,
      category: article.category,
      tags: article.tags,
      is_breaking: article.isBreaking,
      media_items: article.mediaItems || [],
      views: article.views + 1, // Include the incremented view
      created_at: article.createdAt.toISOString(),
      updated_at: article.updatedAt.toISOString(),
      published_at: article.publishedAt.toISOString(),
    }

    return NextResponse.json(formattedArticle)
  } catch (error) {
    console.error("Error fetching news article:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch news article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Update the PUT method to handle media items
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Only admins can edit news" }, { status: 403 })
    }

    const { id } = await params
    const { title, content, summary, coverImageUrl, author, category, tags, isBreaking, mediaItems } =
      await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Get news collection
    const collection = await getNewsCollection()

    // Update the news article
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          content,
          summary: summary || "",
          coverImageUrl,
          author,
          category,
          tags,
          isBreaking,
          mediaItems: mediaItems || [],
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "News article not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating news article:", error)
    return NextResponse.json(
      {
        error: "Failed to update news article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Only admins can delete news" }, { status: 403 })
    }

    const { id } = await params

    // Get news collection
    const collection = await getNewsCollection()

    // Find the news first to check ownership
    const news = await collection.findOne({ _id: new ObjectId(id) })
    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 })
    }

    // Delete the news
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "News not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting news:", error)
    return NextResponse.json(
      { error: "Failed to delete news", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
