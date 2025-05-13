"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import AdvancedVideoPlayer from "@/components/advanced-video-player"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Video {
  id: string
  public_id: string
  url: string
  title: string
  created_at: string
}

export default function VideoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/videos")

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.statusText}`)
        }

        const data = await response.json()
        setVideos(data)

        // Find the current video
        const currentVideo = data.find((v: Video) => v.id === params.id)
        if (currentVideo) {
          setVideo(currentVideo)
        } else {
          setError("Video not found")
        }
      } catch (err) {
        console.error("Error fetching videos:", err)
        setError(err instanceof Error ? err.message : "Failed to load video")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [params.id])

  const handlePrevious = () => {
    if (!video || videos.length <= 1) return

    const currentIndex = videos.findIndex((v) => v.id === video.id)
    if (currentIndex === -1) return

    const prevIndex = (currentIndex - 1 + videos.length) % videos.length
    router.push(`/videos/${videos[prevIndex].id}`)
  }

  const handleNext = () => {
    if (!video || videos.length <= 1) return

    const currentIndex = videos.findIndex((v) => v.id === video.id)
    if (currentIndex === -1) return

    const nextIndex = (currentIndex + 1) % videos.length
    router.push(`/videos/${videos[nextIndex].id}`)
  }

  if (loading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
        </Button>
        <Skeleton className="h-[60vh] w-full rounded-md" />
      </main>
    )
  }

  if (error || !video) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error || "Video not found"}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
      </Button>

      <AdvancedVideoPlayer
        video={video}
        onPrevious={videos.length > 1 ? handlePrevious : undefined}
        onNext={videos.length > 1 ? handleNext : undefined}
      />

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>{video.title || "Untitled Video"}</CardTitle>
            <CardDescription>Uploaded on {new Date(video.created_at).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {videos
                .filter((v) => v.id !== video.id)
                .slice(0, 4)
                .map((v) => (
                  <div key={v.id} className="cursor-pointer" onClick={() => router.push(`/videos/${v.id}`)}>
                    <div className="aspect-video bg-muted rounded-md overflow-hidden relative group">
                      <img
                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${v.public_id}.jpg`}
                        alt={v.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          Play Video
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-medium truncate">{v.title || "Untitled Video"}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
