import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Helper function to get the podcast episodes collection
async function getPodcastEpisodesCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("podcast_episodes")
}

// Helper function to get the podcasts collection
async function getPodcastsCollection() {
  const client = await clientPromise
  const db = client.db("sailor_platform")
  return db.collection("podcasts")
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const podcastId = params.id
    const { title, description, audioUrl, publicId, duration, episodeNumber, season } = await request.json()

    if (!title || !audioUrl) {
      return NextResponse.json({ error: "Title and audio URL are required" }, { status: 400 })
    }

    // Get podcast episodes collection
    const episodesCollection = await getPodcastEpisodesCollection()
    const podcastsCollection = await getPodcastsCollection()

    // Check if podcast exists
    const podcast = await podcastsCollection.findOne({ _id: new ObjectId(podcastId) })
    if (!podcast) {
      return NextResponse.json({ error: "Podcast not found" }, { status: 404 })
    }

    // Store episode in MongoDB
    const result = await episodesCollection.insertOne({
      podcastId: new ObjectId(podcastId),
      title,
      description: description || "",
      audioUrl,
      publicId,
      duration: duration || 0,
      episodeNumber: episodeNumber || 1,
      season: season || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Update episode count in podcast document
    await podcastsCollection.updateOne(
      { _id: new ObjectId(podcastId) },
      { $inc: { episodeCount: 1 }, $set: { updatedAt: new Date() } },
    )

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Error creating podcast episode:", error)
    return NextResponse.json(
      {
        error: "Failed to create podcast episode",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const podcastId = await params.id

    // Get podcast episodes collection
    const collection = await getPodcastEpisodesCollection()

    // Get all episodes for this podcast, sorted by episode number and season
    const episodes = await collection
      .find({ podcastId: new ObjectId(podcastId) })
      .sort({ season: 1, episodeNumber: 1 })
      .toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedEpisodes = episodes.map((episode) => ({
      id: episode._id.toString(),
      podcast_id: episode.podcastId.toString(),
      title: episode.title,
      description: episode.description,
      audio_url: episode.audioUrl,
      public_id: episode.publicId,
      duration: episode.duration,
      episode_number: episode.episodeNumber,
      season: episode.season,
      created_at: episode.createdAt.toISOString(),
      updated_at: episode.updatedAt.toISOString(),
    }))

    return NextResponse.json(formattedEpisodes)
  } catch (error) {
    console.error("Error fetching podcast episodes:", error)
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([])
  }
}
