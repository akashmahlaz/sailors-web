"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Eye, Heart, MessageSquare, RefreshCw, User, Play } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export interface VideoGalleryRef {
  fetchVideos: () => Promise<void>
}

interface Video {
  id: string
  public_id: string
  url: string
  title: string
  description: string
  thumbnail_url: string | null
  user_name: string
  user_image: string | null
  views: number
  likes: number
  comments: any[]
  created_at: string
}

const VideoGallery = forwardRef<VideoGalleryRef, {}>((_, ref) => {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/videos")

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.statusText}`)
      }

      const data = await response.json()
      setVideos(data)
    } catch (err) {
      console.error("Error fetching videos:", err)
      setError(err instanceof Error ? err.message : "Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    fetchVideos,
  }))

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleVideoClick = (videoId: string) => {
    router.push(`/videos/${videoId}`)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
        <Button variant="outline" className="mt-4" onClick={fetchVideos}>
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </Card>
    )
  }

  if (videos.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground mb-4">No videos found. Be the first to upload!</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video, idx) => (
        <Card
          key={video.id}
          className="overflow-hidden cursor-pointer group"
          onClick={() => handleVideoClick(video.id)}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="aspect-video bg-muted relative overflow-hidden group">
            {hoveredIndex === idx ? (
              <video
                src={video.url}
                poster={
                  video.thumbnail_url ||
                  `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${video.public_id}.jpg`
                }
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                style={{ zIndex: 10 }}
              />
            ) : (
              <img
                src={
                  video.thumbnail_url ||
                  `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${video.public_id}.jpg`
                }
                alt={video.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
              <Button variant="secondary" size="icon">
                <Play className="h-5 w-5" />
              </Button>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center z-30">
              <Eye className="h-3 w-3 mr-1" />
              {video.views.toLocaleString()}
            </div>
          </div>
          <CardContent className="p-3">
            <h3 className="font-medium line-clamp-1">{video.title}</h3>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                {video.user_image ? (
                  <img
                    src={video.user_image || "/placeholder.svg"}
                    alt={video.user_name}
                    className="h-5 w-5 rounded-full mr-1"
                  />
                ) : (
                  <User className="h-3 w-3 mr-1" />
                )}
                <span className="line-clamp-1">{video.user_name}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  {video.likes}
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {video.comments?.length || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

VideoGallery.displayName = "VideoGallery"

export default VideoGallery
