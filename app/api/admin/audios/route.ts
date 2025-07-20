import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAudioCollection } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get audio collection
    const collection = await getAudioCollection()

    // Get all audio files
    const audios = await collection.find({}).sort({ created_at: -1 }).toArray()

    // Transform MongoDB _id to id for client-side compatibility
    const formattedAudios = audios.map((audio) => ({
      id: audio._id.toString(),
      ...audio,
      _id: undefined,
    }))

    return NextResponse.json(formattedAudios)
  } catch (error) {
    console.error("Error fetching audio files:", error)
    return NextResponse.json(
      { error: "Failed to fetch audio files", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
