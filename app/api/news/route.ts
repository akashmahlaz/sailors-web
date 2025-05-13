import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// Helper function to get the news collection
async function getNewsCollection() {
  const client = await clientPromise
  const db = client.db("cloudinary_media")
  return db.collection("news")
}

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      content,
      summary,
      coverImageUrl,
      author,
      category,
      tags,
      isBreaking,
      mediaItems, // New field for additional media items
    } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Get news collection
    const collection = await getNewsCollection()

    // Store news article in MongoDB
    const result = await collection.insertOne({
      title,
      content,
      summary: summary || "",
      coverImageUrl: coverImageUrl || null,
      author: author || "Anonymous",
      category: category || "General",
      tags: tags || [],
      isBreaking: isBreaking || false,
      mediaItems: mediaItems || [], // Store additional media items
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error saving news article:", error)
    return NextResponse.json(
      {
        error: "Failed to save news article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get news collection
    const collection = await getNewsCollection()
    const url = new URL(request.url)

    // Get query parameters
    const category = url.searchParams.get("category")
    const isBreaking = url.searchParams.get("breaking") === "true"

    // Build query
    const query: Record<string, any> = {}
    if (category) {
      query.category = category
    }
    if (isBreaking) {
      query.isBreaking = true
    }

    // Get all news articles, sorted by publication date (newest first)
    const news = await collection.find(query).sort({ publishedAt: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedNews = news.map((article) => ({
      id: article._id.toString(),
      title: article.title,
      summary: article.summary,
      content: article.content,
      cover_image_url: article.coverImageUrl,
      author: article.author,
      category: article.category,
      tags: article.tags,
      is_breaking: article.isBreaking,
      media_items: article.mediaItems || [], // Include media items in response
      views: article.views,
      created_at: article.createdAt.toISOString(),
      updated_at: article.updatedAt.toISOString(),
      published_at: article.publishedAt.toISOString(),
    }))

    return NextResponse.json(formattedNews)
  } catch (error) {
    console.error("Error fetching news articles:", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([])
  }
}
