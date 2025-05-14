"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Save, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Video {
  id: string
  title: string
  thumbnail_url: string | null
  public_id: string
  url: string
  views: number
  created_at: string
}

export default function VideoPlaylistCreator() {
  const { data: session } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/videos")
        if (!response.ok) throw new Error("Failed to fetch videos")
        const data = await response.json()
        setVideos(data)
      } catch (error) {
        console.error("Error fetching videos:", error)
        toast({
          title: "Error",
          description: "Failed to load videos. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const handleToggleVideo = (videoId: string) => {
    setSelectedVideos((prev) => (prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a playlist title",
        variant: "destructive",
      })
      return
    }

    if (selectedVideos.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one video",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          isPublic,
          videoIds: selectedVideos,
          userId: session?.user?.id,
          userName: session?.user?.name,
          userImage: session?.user?.image,
        }),
      })

      if (!response.ok) throw new Error("Failed to create playlist")

      const data = await response.json()
      toast({
        title: "Success",
        description: "Playlist created successfully",
      })
      router.push(`/playlists/${data.id}`)
    } catch (error) {
      console.error("Error creating playlist:", error)
      toast({
        title: "Error",
        description: "Failed to create playlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Playlist</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Playlist Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter playlist title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your playlist"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="isPublic" checked={isPublic} onCheckedChange={(checked) => setIsPublic(!!checked)} />
              <Label htmlFor="isPublic">Make this playlist public</Label>
            </div>

            <div className="space-y-2">
              <Label>Select Videos</Label>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No videos available. Upload some videos first.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className={`border rounded-md overflow-hidden cursor-pointer transition-all ${
                        selectedVideos.includes(video.id) ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary"
                      }`}
                      onClick={() => handleToggleVideo(video.id)}
                    >
                      <div className="aspect-video bg-muted relative">
                        <img
                          src={
                            video.thumbnail_url ||
                            `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "/placeholder.svg"}/video/upload/so_0/${video.public_id}.jpg`
                          }
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        {selectedVideos.includes(video.id) && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Plus className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="font-medium text-sm line-clamp-1">{video.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" disabled={submitting || selectedVideos.length === 0}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Create Playlist
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
