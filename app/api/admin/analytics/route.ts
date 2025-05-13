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
} from "@/lib/mongodb-server"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get time range from query parameters
    const searchParams = request.nextUrl.searchParams
    const timeRange = searchParams.get("timeRange") || "30days"

    // Calculate date filter based on time range
    const dateFilter = getDateFilter(timeRange)

    // Get collections
    const videosCollection = await getVideosCollection()
    const audiosCollection = await getAudioCollection()
    const photosCollection = await getPhotosCollection()
    const blogsCollection = await getBlogsCollection()
    const usersCollection = await getUsersCollection()
    const supportRequestsCollection = await getSupportRequestsCollection()

    // Get counts
    const totalVideos = await videosCollection.countDocuments()
    const totalAudios = await audiosCollection.countDocuments()
    const totalPhotos = await photosCollection.countDocuments()
    const totalBlogs = await blogsCollection.countDocuments()
    const totalUsers = await usersCollection.countDocuments()
    const totalSupportRequests = await supportRequestsCollection.countDocuments()

    // For a real implementation, you would query the database for actual analytics data
    // For this example, we'll return mock data

    // In a real implementation, you would aggregate data from your collections
    // For example, to get content growth over time:
    /*
    const contentGrowth = await videosCollection.aggregate([
      { $match: dateFilter },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]).toArray()
    */

    // Return analytics data
    return NextResponse.json({
      totalUsers,
      totalVideos,
      totalAudios,
      totalPhotos,
      totalBlogs,
      totalSupportRequests,
      // In a real implementation, these would be populated with actual data
      contentGrowth: generateMockContentGrowth(),
      contentDistribution: [
        { name: "Videos", value: totalVideos, color: "#3b82f6" },
        { name: "Audios", value: totalAudios, color: "#10b981" },
        { name: "Photos", value: totalPhotos, color: "#f59e0b" },
        { name: "Blogs", value: totalBlogs, color: "#8b5cf6" },
      ],
      userActivity: generateMockUserActivity(),
      popularContent: generateMockPopularContent(),
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
