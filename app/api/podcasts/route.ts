import { type NextRequest, NextResponse } from "next/server"
import { getPodcastsCollection } from "@/lib/mongodb-server"

export async function POST(request: NextRequest) {
  try {
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

    if (!audioUrl && !videoUrl) {
      return NextResponse.json({ error: "Either audio or video file is required" }, { status: 400 })
    }

    // Get podcasts collection
    const collection = await getPodcastsCollection()

    // Store podcast in MongoDB
    const result = await collection.insertOne({
      title,
      description: description || "",
      host: host || "Anonymous",
      coverImageUrl: coverImageUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      photoUrl: photoUrl || null,
      audioUrl,
      audioPublicId,
      videoUrl: videoUrl || null,
      videoPublicId: videoPublicId || null,
      categories: categories || [],
      episodeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error creating podcast:", error)
    return NextResponse.json(
      {
        error: "Failed to create podcast",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Get podcasts collection
    const collection = await getPodcastsCollection()

    // Get all podcasts, sorted by creation date (newest first)
    const podcasts = await collection.find({}).sort({ createdAt: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedPodcasts = podcasts.map((podcast) => ({
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
    }))

    return NextResponse.json(formattedPodcasts)
  } catch (error) {
    console.error("Error fetching podcasts:", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([])
  }
}
