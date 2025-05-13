import { type NextRequest, NextResponse } from "next/server";
import { getVideosCollection } from "@/lib/mongodb-server";

export async function GET() {
  try {
    // Get videos collection
    const collection = await getVideosCollection();

    // Get all videos, sorted by creation date (newest first)
    const videos = await collection.find({}).sort({ createdAt: -1 }).toArray();

    // Transform MongoDB _id to id for client-side compatibility
    const formattedVideos = videos.map((video) => ({
      id: video._id.toString(),
      public_id: video.publicId,
      url: video.url,
      resource_type: video.resourceType,
      created_at: video.createdAt?.toISOString?.() || new Date().toISOString(),
    }));

    return NextResponse.json(formattedVideos);
  } catch (error) {
    console.error("GET /api/admin/videos - Error fetching videos:", error);
    // Return empty array with a 200 status instead of an error
    return NextResponse.json([]);
  }
}
