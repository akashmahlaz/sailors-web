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
import { Loader2, Plus, Save, X, Check } from "lucide-react"
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
  const [playlistCreatorVideoThumbnails, setPlaylistCreatorVideoThumbnails] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/videos")
        if (!response.ok) throw new Error("Failed to fetch videos")
        const data = await response.json()
         const videosData = Array.isArray(data) ? data : data.videos || [];
        setVideos(videosData)

         // Generate thumbnails for videos
         videosData.forEach((video: Video) => {
          if (!video.thumbnail_url) {
            generateVideoThumbnail(video.url, video.id);
          }
        });

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

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the playlist.",
        variant: "destructive",
      })
      return
    }
    if (selectedVideos.length === 0) {
       toast({
        title: "Select videos",
        description: "Please select at least one video for the playlist.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
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
          userId: session?.user?.id, // Assuming user ID is available in session
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create playlist")
      }

      const newPlaylist = await response.json()
      toast({
        title: "Success",
        description: "Playlist created successfully!",
      })
      router.push(`/playlists/${newPlaylist._id}`)
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

   // Generate video thumbnail function
   const generateVideoThumbnail = (videoUrl: string, videoId: string) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';

    // Try multiple timestamps
    const timestamps = [1, 2, 3];
    let currentTimestampIndex = 0;

    const tryNextTimestamp = () => {
      if (currentTimestampIndex < timestamps.length) {
        video.currentTime = timestamps[currentTimestampIndex];
        currentTimestampIndex++;
      } else {
        // All timestamps tried, use placeholder if no thumbnail generated
         setPlaylistCreatorVideoThumbnails(prev => ({
           ...prev,
           [videoId]: '/placeholder.svg'
         }));
      }
    };

    video.addEventListener('loadeddata', () => {
      tryNextTimestamp();
    });

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPlaylistCreatorVideoThumbnails(prev => ({
          ...prev,
          [videoId]: thumbnailUrl
        }));
         video.remove(); // Clean up the video element
      }
    });

    video.addEventListener('error', (e) => {
      console.error('Error generating thumbnail for video:', videoId, e);
       setPlaylistCreatorVideoThumbnails(prev => ({
         ...prev,
         [videoId]: '/placeholder.svg'
       }));
       video.remove(); // Clean up the video element
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Playlist</CardTitle>
        </CardHeader>
        <form onSubmit={handleCreatePlaylist}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Playlist"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A collection of my favorite maritime videos"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(Boolean(checked))}
              />
              <Label htmlFor="isPublic">Public Playlist</Label>
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
                             playlistCreatorVideoThumbnails[video.id] ||
                             `/placeholder.svg`
                          }
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        {selectedVideos.includes(video.id) && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="font-medium text-sm line-clamp-1">{video.title}</p>
                      </CardContent>
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
