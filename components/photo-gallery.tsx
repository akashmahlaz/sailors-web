"use client"

import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  RefreshCw,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  User,
  Calendar,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Photo {
  id: string
  public_id: string
  url: string
  title: string
  description: string
  tags: string[]
  user_id?: string
  user_name?: string
  user_image?: string
  views: number
  likes: number
  created_at: string
}

interface Comment {
  id: string
  photo_id: string
  user_id: string
  user_name: string
  user_image?: string
  content: string
  created_at: string
  likes: number
}

export interface PhotoGalleryRef {
  fetchPhotos: () => Promise<void>
}

function ZoomableImage({ src, alt, onSwipeLeft, onSwipeRight }: { src: string, alt: string, onSwipeLeft: () => void, onSwipeRight: () => void }) {
  const imgRef = React.useRef<HTMLImageElement>(null)
  const [zoom, setZoom] = React.useState(1)
  const [offset, setOffset] = React.useState({ x: 0, y: 0 })
  const [dragging, setDragging] = React.useState(false)
  const [start, setStart] = React.useState<{ x: number, y: number } | null>(null)
  const [touchStart, setTouchStart] = React.useState<{ x: number, y: number, time: number } | null>(null)
  const [lastTap, setLastTap] = React.useState<number>(0)

  // Double-tap/double-click to zoom
  const handleDoubleClick = (e: React.MouseEvent | React.TouchEvent) => {
    setZoom((z) => (z === 1 ? 2 : 1))
    setOffset({ x: 0, y: 0 })
  }

  // Mouse drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return
    setDragging(true)
    setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || zoom === 1) return
    setOffset({ x: e.clientX - (start?.x || 0), y: e.clientY - (start?.y || 0) })
  }
  const handleMouseUp = () => setDragging(false)

  // Touch drag to pan, swipe to navigate, double-tap to zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const now = Date.now()
      if (now - lastTap < 300) {
        handleDoubleClick(e)
        setLastTap(0)
      } else {
        setLastTap(now)
        setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY, time: now })
      }
    }
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (zoom === 1 || e.touches.length !== 1 || !touchStart) return
    setOffset({
      x: e.touches[0].clientX - touchStart.x,
      y: e.touches[0].clientY - touchStart.y,
    })
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return
    const dx = (offset.x || 0)
    if (zoom === 1 && Math.abs(dx) > 60) {
      if (dx < 0) onSwipeLeft()
      else onSwipeRight()
    }
    setDragging(false)
    setTouchStart(null)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className="max-h-full max-w-full object-contain select-none touch-none cursor-zoom-in"
      style={{
        transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
        transition: dragging ? "none" : "transform 0.2s cubic-bezier(.4,2,.6,1)",
        touchAction: "none",
      }}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      draggable={false}
    />
  )
}

const PhotoGallery = forwardRef<PhotoGalleryRef>((props, ref) => {
  const { data: session } = useSession()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [showInfo, setShowInfo] = useState(true)
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({})
  const [commentText, setCommentText] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("info")

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/photos")

      if (!response.ok) {
        throw new Error(`Failed to fetch photos: ${response.statusText}`)
      }

      const data = await response.json()
      setPhotos(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching photos:", err)
      setError(err instanceof Error ? err.message : "Failed to load photos")
    } finally {
      setLoading(false)
    }
  }

  // Expose the fetchPhotos method via ref
  useImperativeHandle(ref, () => ({
    fetchPhotos,
  }))

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchComments = async (photoId: string) => {
    try {
      setLoadingComments(true)
      const response = await fetch(`/api/photos/${photoId}/comments`)

      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error("Error fetching comments:", error)
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  const recordView = async (photoId: string) => {
    try {
      await fetch(`/api/photos/${photoId}/view`, {
        method: "POST",
      })

      // Update local view count
      setPhotos(photos.map((photo) => (photo.id === photoId ? { ...photo, views: photo.views + 1 } : photo)))

      if (selectedPhoto && selectedPhoto.id === photoId) {
        setSelectedPhoto({
          ...selectedPhoto,
          views: selectedPhoto.views + 1,
        })
      }
    } catch (error) {
      console.error("Error recording view:", error)
    }
  }

  const handlePhotoSelect = async (photo: Photo) => {
    setSelectedPhoto(photo)
    setShowInfo(true)
    setShowComments(false)
    setActiveTab("info")
    await recordView(photo.id)
    await fetchComments(photo.id)

    // Check if this photo is liked by the current user
    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/photos/${photo.id}/like/check`, {
          method: "GET",
        })
        if (response.ok) {
          const { liked } = await response.json()
          setLikedPhotos((prev) => ({
            ...prev,
            [photo.id]: liked,
          }))
        }
      } catch (error) {
        console.error("Error checking like status:", error)
      }
    }
  }

  const downloadPhoto = (photo: Photo) => {
    // Create a temporary anchor element
    const a = document.createElement("a")
    a.href = photo.url
    a.download = `${photo.title || "photo"}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const navigatePhoto = (direction: "prev" | "next") => {
    if (!selectedPhoto || photos.length <= 1) return

    const currentIndex = photos.findIndex((photo) => photo.id === selectedPhoto.id)
    if (currentIndex === -1) return

    let newIndex
    if (direction === "prev") {
      newIndex = (currentIndex - 1 + photos.length) % photos.length
    } else {
      newIndex = (currentIndex + 1) % photos.length
    }

    handlePhotoSelect(photos[newIndex])
  }

  const toggleLike = async (photoId: string) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like photos",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/photos/${photoId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to like photo")
      }

      const data = await response.json()

      // Update liked status
      setLikedPhotos((prev) => ({
        ...prev,
        [photoId]: data.liked,
      }))

      // Update photo likes count
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === photoId
            ? { ...photo, likes: data.liked ? photo.likes + 1 : Math.max(0, photo.likes - 1) }
            : photo,
        ),
      )

      // Update selected photo if it's the one being liked
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto((prev) =>
          prev
            ? {
                ...prev,
                likes: data.liked ? prev.likes + 1 : Math.max(0, prev.likes - 1),
              }
            : null,
        )
      }
    } catch (error) {
      console.error("Error liking photo:", error)
      toast({
        title: "Error",
        description: "Failed to like photo",
        variant: "destructive",
      })
    }
  }

  const handleComment = async () => {
    if (!session || !selectedPhoto || !commentText.trim()) {
      return
    }

    try {
      const response = await fetch(`/api/photos/${selectedPhoto.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user?.id,
          userName: session.user?.name,
          userImage: session.user?.image,
          content: commentText.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      const data = await response.json()
      setComments((prev) => [data.comment, ...prev])
      setCommentText("")
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  const likeComment = async (commentId: string) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like comments",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/photos/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to like comment")
      }

      const data = await response.json()

      // Update comment likes
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? { ...comment, likes: data.liked ? comment.likes + 1 : Math.max(0, comment.likes - 1) }
            : comment,
        ),
      )
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  const sharePhoto = () => {
    if (!selectedPhoto) return

    if (navigator.share) {
      navigator
        .share({
          title: selectedPhoto.title || "Shared Photo",
          text: selectedPhoto.description || "Check out this photo!",
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Photo link copied to clipboard",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Photo Gallery</CardTitle>
          <CardDescription>Loading your photos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
        <div>
          <CardTitle className="dark:text-white text-black">Maritime Moments</CardTitle>
          <CardDescription>
            {photos.length > 0 ? `${photos.length} moments in your gallery` : "No maritime moments yet"}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPhotos} disabled={loading} className="border-gray-200">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Gallery
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading photos</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {photos.length === 0 && !error ? (
          <div className="text-center py-8 text-muted-foreground">
            Capture your first maritime moment to see it here
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-md overflow-hidden cursor-pointer bg-gradient-to-b from-white to-gray-50 shadow-sm hover:shadow-md transition-all"
                onClick={() => handlePhotoSelect(photo)}
              >
                <img
                  src={photo.url || "/placeholder.svg"}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <h3 className="font-medium text-white truncate">{photo.title}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-white/20 text-white hover:bg-white/40"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(photo.id)
                        }}
                      >
                        <Heart className="h-4 w-4" fill={likedPhotos[photo.id] ? "white" : "none"} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-white/20 text-white hover:bg-white/40"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePhotoSelect(photo)
                          setActiveTab("comments")
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-white/20 text-white hover:bg-white/40"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadPhoto(photo)
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {photo.views}
                </div>
                {photo.user_name && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {photo.user_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Photo Lightbox */}
        <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
          <DialogContent className="w-full max-w-full sm:max-w-3xl md:max-w-5xl p-0 h-[90vh] max-h-[90dvh] flex flex-col md:flex-row min-h-0 overflow-hidden">
            <div className="relative flex-1 flex items-center justify-center bg-black min-h-0 overflow-hidden w-full">
              {selectedPhoto && (
                <ZoomableImage
                  src={selectedPhoto.url || "/placeholder.svg"}
                  alt={selectedPhoto.title}
                  onSwipeLeft={() => navigatePhoto("next")}
                  onSwipeRight={() => navigatePhoto("prev")}
                />
              )}

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white hover:bg-black/20 z-10"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 z-10"
                onClick={() => navigatePhoto("prev")}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 z-10"
                onClick={() => navigatePhoto("next")}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>

              {/* Social buttons */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={() => selectedPhoto && toggleLike(selectedPhoto.id)}
                >
                  <Heart className="h-6 w-6" fill={selectedPhoto && likedPhotos[selectedPhoto.id] ? "white" : "none"} />
                  <span className="sr-only">Like</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={() => setActiveTab("comments")}
                >
                  <MessageSquare className="h-6 w-6" />
                  <span className="sr-only">Comments</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={sharePhoto}
                >
                  <Share2 className="h-6 w-6" />
                  <span className="sr-only">Share</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={() => selectedPhoto && downloadPhoto(selectedPhoto)}
                >
                  <Download className="h-6 w-6" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </div>

            {selectedPhoto && (
              <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-gray-200 flex flex-col min-h-0 max-h-[50vh] md:max-h-full overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                  <TabsList className="grid w-full grid-cols-2 p-0 h-12">
                    <TabsTrigger value="info" className="rounded-none data-[state=active]:bg-gray-100">
                      <Info className="h-4 w-4 mr-2" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="rounded-none data-[state=active]:bg-gray-100">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comments
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedPhoto.title}</h2>
                        {selectedPhoto.description && <p className="mt-2 text-gray-600">{selectedPhoto.description}</p>}
                      </div>

                      <div className="flex items-center gap-3 py-3 border-t border-b border-gray-100">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedPhoto.user_image || "/placeholder.svg"} />
                          <AvatarFallback>{selectedPhoto.user_name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedPhoto.user_name || "Anonymous"}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(selectedPhoto.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span>{selectedPhoto.views} views</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Heart className="h-4 w-4 text-gray-500" />
                          <span>{selectedPhoto.likes} likes</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{new Date(selectedPhoto.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{new Date(selectedPhoto.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-2">Tags</h3>
                          <div className="flex flex-wrap gap-1">
                            {selectedPhoto.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-gray-100 text-gray-800 border-gray-200"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="comments" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={session?.user?.image || "/placeholder.svg?height=40&width=40&query=avatar"}
                          />
                          <AvatarFallback>{session?.user?.name?.[0] || "S"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder={session ? "Add a comment..." : "Sign in to comment"}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="min-h-[80px] border-gray-200 focus-visible:ring-gray-500"
                            disabled={!session}
                          />
                          <Button
                            onClick={handleComment}
                            className="mt-2 bg-gray-800 hover:bg-gray-900"
                            disabled={!commentText.trim() || !session}
                          >
                            Post Comment
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                      {loadingComments ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <div className="flex-1">
                                <Skeleton className="h-4 w-1/4 mb-2" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4 mt-1" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : comments.length > 0 ? (
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.user_image || "/placeholder.svg"} />
                                <AvatarFallback>{comment.user_name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{comment.user_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="mt-1">{comment.content}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 text-xs text-muted-foreground mt-1"
                                  onClick={() => likeComment(comment.id)}
                                >
                                  <Heart className="h-3 w-3 mr-1" /> {comment.likes}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
})

PhotoGallery.displayName = "PhotoGallery"

export default PhotoGallery
