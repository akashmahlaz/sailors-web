import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import {
  getVideosCollection,
  getAudioCollection,
  getPhotosCollection,
  getBlogsCollection,
  getUsersCollection,
  getSupportRequestsCollection,
  getPlaylistsCollection,
} from "@/lib/mongodb-server"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const timeRange = request.nextUrl.searchParams.get("timeRange") || "30days"
    const now = new Date()
    let startDate = new Date()

    // Calculate start date based on timeRange
    switch (timeRange) {
      case "7days":
        startDate.setDate(now.getDate() - 7)
        break
      case "30days":
        startDate.setDate(now.getDate() - 30)
        break
      case "90days":
        startDate.setDate(now.getDate() - 90)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case "all":
        startDate = new Date(0) // Beginning of time
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Get collections
    const videosCollection = await getVideosCollection()
    const audiosCollection = await getAudioCollection()
    const photosCollection = await getPhotosCollection()
    const blogsCollection = await getBlogsCollection()
    const usersCollection = await getUsersCollection()
    const supportRequestsCollection = await getSupportRequestsCollection()
    const playlistsCollection = await getPlaylistsCollection()

    // Get total counts
    const [totalUsers, totalVideos, totalAudios, totalPhotos, totalBlogs, totalSupportRequests, totalPlaylists] = await Promise.all([
      usersCollection.countDocuments(),
      videosCollection.countDocuments(),
      audiosCollection.countDocuments(),
      photosCollection.countDocuments(),
      blogsCollection.countDocuments(),
      supportRequestsCollection.countDocuments(),
      playlistsCollection.countDocuments(),
    ])

    // Get content growth data
    const contentGrowth = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        const [videos, audios, photos, blogs, playlists] = await Promise.all([
          videosCollection.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          }),
          audiosCollection.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          }),
          photosCollection.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          }),
          blogsCollection.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          }),
          playlistsCollection.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          }),
        ])

        return {
          date: `${date.getMonth() + 1}/${date.getFullYear()}`,
          videos,
          audios,
          photos,
          blogs,
          playlists,
        }
      }),
    ).then(results => results.reverse())

    // Get content distribution
    const contentDistribution = [
      { name: "Videos", value: totalVideos, color: "#3b82f6" },
      { name: "Audios", value: totalAudios, color: "#10b981" },
      { name: "Photos", value: totalPhotos, color: "#f59e0b" },
      { name: "Blogs", value: totalBlogs, color: "#8b5cf6" },
      { name: "Playlists", value: totalPlaylists, color: "#8b5cf6" },
    ]

    // Get user activity data
    const userActivity = await Promise.all(
      Array.from({ length: 30 }, async (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const startOfDay = new Date(date.setHours(0, 0, 0, 0))
        const endOfDay = new Date(date.setHours(23, 59, 59, 999))

        const [signups, uploads] = await Promise.all([
          usersCollection.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          }),
          videosCollection.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          }),
        ])

        return {
          date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
          signups,
          uploads,
        }
      }),
    ).then(results => results.reverse())

    // Get popular content
    const popularVideos = await videosCollection
      .find({})
      .sort({ views: -1 })
      .limit(5)
      .toArray()

    const popularContent = popularVideos.map(video => ({
      id: video._id.toString(),
      title: video.title,
      type: "video",
      views: video.views || 0,
      likes: video.likes?.length || 0,
      comments: video.comments?.length || 0,
    }))

    return NextResponse.json({
      totalUsers,
      totalVideos,
      totalAudios,
      totalPhotos,
      totalBlogs,
      totalSupportRequests,
      totalPlaylists,
      contentGrowth,
      contentDistribution,
      userActivity,
      popularContent,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Helper function to generate date filter based on time range
function getDateFilter(timeRange: string) {
  const now = new Date()
  let startDate = new Date()

  switch (timeRange) {
    case "7days":
      startDate.setDate(now.getDate() - 7)
      break
    case "30days":
      startDate.setDate(now.getDate() - 30)
      break
    case "90days":
      startDate.setDate(now.getDate() - 90)
      break
    case "year":
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case "all":
      startDate = new Date(0) // Beginning of time
      break
    default:
      startDate.setDate(now.getDate() - 30) // Default to 30 days
  }

  return { created_at: { $gte: startDate } }
}

// Mock data generators
function generateMockContentGrowth() {
  return Array.from({ length: 12 }, (_, i) => ({
    date: `${i + 1}/2023`,
    videos: Math.floor(Math.random() * 50) + 10,
    audios: Math.floor(Math.random() * 30) + 5,
    photos: Math.floor(Math.random() * 100) + 20,
    blogs: Math.floor(Math.random() * 20) + 5,
  }))
}

function generateMockUserActivity() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}/5/2023`,
    signups: Math.floor(Math.random() * 15),
    logins: Math.floor(Math.random() * 100) + 50,
    uploads: Math.floor(Math.random() * 40) + 10,
  }))
}

function generateMockPopularContent() {
  return [
    { id: "1", title: "Sailing the Caribbean", type: "video", views: 12453, likes: 843, comments: 156 },
    { id: "2", title: "Sea Shanty Collection", type: "audio", views: 8932, likes: 721, comments: 89 },
    { id: "3", title: "Sunset at Sea", type: "photo", views: 7821, likes: 1243, comments: 67 },
    { id: "4", title: "Life of a Sailor", type: "blog", views: 6543, likes: 532, comments: 124 },
    { id: "5", title: "Storm Navigation", type: "video", views: 5932, likes: 421, comments: 78 },
  ]
}
