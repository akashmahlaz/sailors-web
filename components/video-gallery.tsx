"use client"

import type React from "react"

import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw, MoreVertical, Eye, Clock, Search, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSession } from "next-auth/react"
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"

interface Video {
  id: string
  _id?: string
  public_id: string
  url: string
  thumbnail_url?: string
  title?: string
  description?: string
  views?: number
  likes?: number
  comments?: number
  created_at: string
  user?: {
    id: string
    name: string
    image?: string
  }
  userId?: string
  userName?: string
  userImage?: string
}

export interface VideoGalleryRef {
  fetchVideos: () => Promise<void>
}

interface VideoGalleryProps {
  limit?: number
  showSearch?: boolean
  showFilters?: boolean
  userId?: string
  horizontal?: boolean
  className?: string
}

const VideoGallery = forwardRef<VideoGalleryRef, VideoGalleryProps>(
  ({ limit = 10, showSearch = true, showFilters = true, userId, horizontal = false, className }, ref) => {
    const { data: session } = useSession()
    const { addNotification } = useNotifications()
    const [videos, setVideos] = useState<Video[]>([])
    const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [sort, setSort] = useState<"newest" | "popular" | "oldest">("newest")
    const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({})
    const [commentText, setCommentText] = useState("")
    const [replyText, setReplyText] = useState<Record<string, string>>({})
    const [showReplies, setShowReplies] = useState<Record<string, boolean>>({})
    const [replyingTo, setReplyingTo] = useState<string | null>(null)

    // Mock comments for demonstration
    const [videoComments, setVideoComments] = useState<Record<string, Comment[]>>({})

    const fetchVideos = async () => {
      try {
        setLoading(true)
        let url = "/api/videos"

        // Add query parameters
        const params = new URLSearchParams()
        if (limit) params.append("limit", limit.toString())
        if (userId) params.append("userId", userId)

        // Append params to URL if they exist
        if (params.toString()) {
          url += `?${params.toString()}`
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.statusText}`)
        }

        // Try to parse the response as JSON
        let data
        try {
          data = await response.json()
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError)
          throw new Error("Invalid response format from server")
        }

        // Handle different response formats
        const videoList = Array.isArray(data) ? data : data.videos || []

        // Enrich video data
        const enrichedVideos = videoList.map((video: any) => ({
          ...video,
          id: video.id || video._id,
          _id: video._id || video.id,
          title: video.title || video.public_id.split("/").pop() || "Untitled Video",
          description: video.description || "No description provided",
          views: video.views || Math.floor(Math.random() * 1000),
          likes: video.likes || Math.floor(Math.random() * 100),
          comments: video.comments || Math.floor(Math.random() * 20),
          userId: video.userId || video.user?.id,
          userName: video.userName || video.user?.name || "Anonymous Sailor",
          userImage: video.userImage || video.user?.image,
        }))

        setVideos(enrichedVideos)
        applyFilters(enrichedVideos, searchQuery, sort)
        setError(null)
      } catch (err) {
        console.error("Error fetching videos:", err)
        setError(err instanceof Error ? err.message : "Failed to load videos")
      } finally {
        setLoading(false)
      }
    }

    const applyFilters = (videoList: Video[], query: string, sortBy: string) => {
      // Filter by search query
      let filtered = videoList
      if (query) {
        filtered = filtered.filter(
          (video) =>
            video.title?.toLowerCase().includes(query.toLowerCase()) ||
            video.description?.toLowerCase().includes(query.toLowerCase()),
        )
      }

      // Sort videos
      switch (sortBy) {
        case "newest":
          filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          break
        case "oldest":
          filtered = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          break
        case "popular":
          filtered = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0))
          break
      }

      setFilteredVideos(filtered)
    }

    // Expose the fetchVideos method via ref
    useImperativeHandle(ref, () => ({
      fetchVideos,
    }))

    useEffect(() => {
      fetchVideos()
    }, [userId])

    useEffect(() => {
      applyFilters(videos, searchQuery, sort)
    }, [searchQuery, sort])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    }

    const toggleLike = (videoId: string) => {
      const isLiked = !likedVideos[videoId]
      setLikedVideos((prev) => ({
        ...prev,
        [videoId]: isLiked,
      }))

      // Add notification when a user likes a video
      if (isLiked) {
        addNotification({
          type: "like",
          message: `You liked a sea short`,
          link: `/videos/${videoId}`,
        })
      }
    }

    const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`
    }

    const formatTimeAgo = (dateString: string) => {
      const now = new Date()
      const past = new Date(dateString)
      const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

      if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
      return `${Math.floor(diffInSeconds / 31536000)} years ago`
    }

    if (loading && videos.length === 0) {
      return (
        <div className={cn("space-y-4", className)}>
          {showSearch && (
            <div className="flex mb-4">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          )}

          <div className={horizontal ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={horizontal ? "" : "flex gap-4"}>
                <Skeleton
                  className={horizontal ? "aspect-video w-full rounded-md mb-2" : "h-20 w-36 rounded-md flex-shrink-0"}
                />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  {horizontal && <Skeleton className="h-4 w-1/2" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className={className}>
        {showSearch && (
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>

            {showFilters && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Sort by: {sort.charAt(0).toUpperCase() + sort.slice(1)}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort videos</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSort("newest")}>Newest first</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("oldest")}>Oldest first</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("popular")}>Most popular</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button variant="outline" size="icon" onClick={fetchVideos} disabled={loading} title="Refresh videos">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {filteredVideos.length === 0 && !error ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="mb-3 text-slate-400">
              <Film className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-medium mb-2">No videos found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No videos match your search criteria" : "Chart your first voyage to see it here"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div
            className={horizontal ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-6"}
          >
            {filteredVideos.map((video) => (horizontal ? renderVideoCard(video) : renderVideoRow(video)))}
          </div>
        )}
      </div>
    )

    function renderVideoCard(video: Video) {
      return (
        <Card key={video.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group">
          <CardContent className="p-0">
            <Link href={`/videos/${video.id || video._id}`} className="block">
              <div className="aspect-video relative overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-t-md">
                <img
                  src={
                    video.thumbnail_url ||
                    `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${video.public_id}.jpg`
                  }
                  alt={video.title || "Video thumbnail"}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(Math.floor(Math.random() * 600))}
                </div>
              </div>
            </Link>

            <div className="p-3">
              <div className="flex gap-3">
                <Link href={`/profile/${video.userId}`} className="flex-shrink-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={video.userImage || "/placeholder.svg?height=36&width=36&query=sailor"} />
                    <AvatarFallback>{video.userName?.[0] || "S"}</AvatarFallback>
                  </Avatar>
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/videos/${video.id || video._id}`} className="block">
                    <h3 className="font-medium line-clamp-2 text-sm text-slate-900 dark:text-slate-100 mb-1">
                      {video.title}
                    </h3>
                  </Link>

                  <Link href={`/profile/${video.userId}`} className="block">
                    <p className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                      {video.userName}
                    </p>
                  </Link>

                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-500 mt-1 space-x-2">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {video.views}
                    </span>
                    <span>•</span>
                    <span>{formatTimeAgo(video.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    function renderVideoRow(video: Video) {
      return (
        <div key={video.id} className="flex gap-4 group">
          <Link href={`/videos/${video.id || video._id}`} className="flex-shrink-0 relative">
            <div className="w-36 h-20 sm:w-48 sm:h-28 bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden">
              <img
                src={
                  video.thumbnail_url ||
                  `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${video.public_id}.jpg`
                }
                alt={video.title || "Video thumbnail"}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(Math.floor(Math.random() * 600))}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/videos/${video.id || video._id}`} className="block">
              <h3 className="font-medium line-clamp-2 text-slate-900 dark:text-slate-100 mb-1">{video.title}</h3>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-600 dark:text-slate-400">
              <Link href={`/profile/${video.userId}`} className="hover:text-slate-900 dark:hover:text-slate-200">
                {video.userName}
              </Link>

              <div className="hidden sm:flex text-slate-500">•</div>

              <div className="flex items-center gap-3">
                <span className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {video.views} views
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimeAgo(video.created_at)}
                </span>
              </div>
            </div>

            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-500 line-clamp-1 mt-2">
              {video.description}
            </p>
          </div>

          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleLike(video.id)}>
                  {likedVideos[video.id] ? "Unlike" : "Like"} video
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/videos/${video.id || video._id}`, "_blank")}>
                  Open in new tab
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    addNotification({
                      type: "share",
                      message: `You shared a sea short`,
                      link: `/videos/${video.id}`,
                    })
                  }}
                >
                  Share video
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )
    }
  },
)

VideoGallery.displayName = "VideoGallery"

export default VideoGallery
