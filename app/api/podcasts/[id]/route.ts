import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Helper function to get the podcasts collection
async function getPodcastsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("podcasts")
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get podcasts collection
    const collection = await getPodcastsCollection()

    // Find the podcast by ID
    const podcast = await collection.findOne({ _id: new ObjectId(id) })

    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 })
    }

    // Transform MongoDB _id to id for client-side compatibility
    const formattedPodcast = {
      id: podcast._id.toString(),
      title: podcast.title,
      description: podcast.description,
      host: podcast.host,
      cover_image_url: podcast.coverImageUrl,
      thumbnail_url: podcast.thumbnailUrl,
      photo_url: podcast.photoUrl,
      audio_url: podcast.audioUrl,
      audio_public_id: podcast.audioPublicId,
      video_url: podcast.videoUrl,
      video_public_id: podcast.videoPublicId,
      categories: podcast.categories,
      episode_count: podcast.episodeCount,
      created_at: podcast.createdAt.toISOString(),
      updated_at: podcast.updatedAt.toISOString(),
    }

    return NextResponse.json(formattedPodcast)
  } catch (error) {
    console.error("Error fetching podcast:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch podcast",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const {
      title,
      description,
      host,
      coverImageUrl,
      thumbnailUrl,
      photoUrl,
      audioUrl,
      audioPublicId,
      videoUrl,
      videoPublicId,
      categories,
    } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Podcast title is required" }, { status: 400 })
    }

    // Get podcasts collection
    const collection = await getPodcastsCollection()

    // Update the podcast
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          description: description || "",
          host: host || "Anonymous",
          coverImageUrl: coverImageUrl || null,
          thumbnailUrl: thumbnailUrl || null,
          photoUrl: photoUrl || null,
          audioUrl: audioUrl || null,
          audioPublicId: audioPublicId || null,
          videoUrl: videoUrl || null,
          videoPublicId: videoPublicId || null,
          categories: categories || [],
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating podcast:", error)
    return NextResponse.json(
      {
        error: "Failed to update podcast",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get podcasts collection
    const collection = await getPodcastsCollection()

    // Delete the podcast
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting podcast:", error)
    return NextResponse.json(
      {
        error: "Failed to delete podcast",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
