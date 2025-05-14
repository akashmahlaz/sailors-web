"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, Edit, Play, Trash2, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Playlist {
  id: string
  title: string
  description: string
  isPublic: boolean
  videoIds: string[]
  userId: string
  userName: string
  userImage: string | null
  views: number
  created_at: string
  updated_at: string
}

interface Video {
  id: string
  public_id: string
  url: string
  title: string
  thumbnail_url: string | null
  views: number
  created_at: string
}

export default function PlaylistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchPlaylistAndVideos = async () => {
      try {
        setLoading(true)

        // Fetch playlist
        const playlistResponse = await fetch(`/api/playlists/${params.id}`)
        if (!playlistResponse.ok) {
          throw new Error(`Failed to fetch playlist: ${playlistResponse.statusText}`)
        }
        const playlistData = await playlistResponse.json()
        setPlaylist(playlistData)

        // Fetch all videos
        const videosResponse = await fetch("/api/videos")
        if (!videosResponse.ok) {
          throw new Error(`Failed to fetch videos: ${videosResponse.statusText}`)
        }
        const allVideos = await videosResponse.json()

        // Filter videos that are in the playlist
        const playlistVideos = allVideos.filter((video: Video) => playlistData.videoIds.includes(video.id))
        setVideos(playlistVideos)

        // Record view
        await fetch(`/api/playlists/${params.id}/view`, {
          method: "POST",
        }).catch(console.error) // Don't fail if view recording fails
      } catch (err) {
        console.error("Error fetching playlist data:", err)
        setError(err instanceof Error ? err.message : "Failed to load playlist")
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylistAndVideos()
  }, [params.id])

  const handleDeletePlaylist = async () => {
    if (!playlist) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/playlists/${playlist.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete playlist")
      }

      toast({
        title: "Success",
        description: "Playlist deleted successfully",
      })
      router.push("/playlists")
    } catch (error) {
      console.error("Error deleting playlist:", error)
      toast({
        title: "Error",
        description: "Failed to delete playlist",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/playlists")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Playlists
        </Button>
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !playlist) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/playlists")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Playlists
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error || "Playlist not found"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOwner = session?.user?.id === playlist.userId

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/playlists")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Playlists
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{playlist.title}</CardTitle>
                  <CardDescription>{playlist.description || "No description provided"}</CardDescription>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/playlists/edit/${playlist.id}`)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={playlist.userImage || undefined} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{playlist.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    Created {formatDistanceToNow(new Date(playlist.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>{videos.length} videos</div>
                <div>{playlist.views} views</div>
                <div>{playlist.isPublic ? "Public" : "Private"}</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video, index) => (
              <Card key={video.id} className="overflow-hidden">
                <div
                  className="aspect-video bg-muted relative cursor-pointer group"
                  onClick={() => router.push(`/videos/${video.id}`)}
                >
                  <img
                    src={
                      video.thumbnail_url ||
                      `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "/placeholder.svg"}/video/upload/so_0/${video.public_id}.jpg`
                    }
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{video.views.toLocaleString()} views</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {videos.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">This playlist has no videos.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Up Next</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="flex gap-2 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors"
                  onClick={() => router.push(`/videos/${video.id}`)}
                >
                  <div className="relative aspect-video w-24 min-w-[96px] bg-muted rounded overflow-hidden">
                    <img
                      src={
                        video.thumbnail_url ||
                        `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "/placeholder.svg"}/video/upload/so_0/${video.public_id}.jpg`
                      }
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">{index + 1}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{video.views.toLocaleString()} views</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the playlist. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlaylist} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
