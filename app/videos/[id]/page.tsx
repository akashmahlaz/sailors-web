"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import AdvancedVideoPlayer from "@/components/advanced-video-player"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, Heart, MessageSquare, Send, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

interface Video {
  id: string
  public_id: string
  url: string
  title: string
  description: string
  thumbnail_url: string | null
  user_id: string
  user_name: string
  user_image: string | null
  views: number
  likes: { userId: string; timestamp: string }[]
  comments: Comment[]
  created_at: string
}

interface Comment {
  id: string
  userId: string
  userName: string
  userImage: string | null
  content: string
  timestamp: string
  likes: number
}

export default function VideoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [video, setVideo] = useState<Video | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const [videoThumbnails, setVideoThumbnails] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/videos")

        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.statusText}`)
        }

        const data = await response.json()
        // Handle both array and object with videos property
        const videosArray = Array.isArray(data) ? data : data.videos || []

        // Find the current video
        const currentVideo = videosArray.find((v: Video) => v.id === params.id)
        if (currentVideo) {
          setVideo(currentVideo)
          setLikesCount(currentVideo.likes?.length || 0)

          // Check if user has liked the video
          if (session?.user?.id && Array.isArray(currentVideo.likes)) {
            setLiked(currentVideo.likes.some(like => like.userId === session.user.id))
          }

          // Record view
          await fetch(`/api/videos/${currentVideo.id}/view`, {
            method: "POST",
          })

          // Get related videos (excluding current)
          const related = videosArray.filter((v: Video) => v.id !== currentVideo.id).slice(0, 6)
          setRelatedVideos(related)

          // Fetch comments
          fetchComments(currentVideo.id)
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
  }, [params.id, session?.user?.id])

  const fetchComments = async (videoId: string) => {
    try {
      setCommentsLoading(true)
      const response = await fetch(`/api/videos/${videoId}/comments`)

      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const data = await response.json()
      setComments(data)
    } catch (err) {
      console.error("Error fetching comments:", err)
    } finally {
      setCommentsLoading(false)
    }
  }

  const handlePrevious = () => {
    if (!video || relatedVideos.length === 0) return

    router.push(`/videos/${relatedVideos[relatedVideos.length - 1].id}`)
  }

  const handleNext = () => {
    if (!video || relatedVideos.length === 0) return

    router.push(`/videos/${relatedVideos[0].id}`)
  }

  const handleLike = async () => {
    if (!session || !video) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like videos",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/videos/${video.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update like")
      }

      const data = await response.json()
      setLiked(data.liked)
      setLikesCount(data.likesCount)
    } catch (err) {
      console.error("Error liking video:", err)
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      })
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !video || !comment.trim()) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/videos/${video.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user?.id,
          userName: session.user?.name,
          userImage: session.user?.image,
          content: comment.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      const data = await response.json()

      // Add new comment to the list
      setComments((prev) => [data.comment, ...prev])

      // Clear input
      setComment("")

      // Focus back on input
      if (commentInputRef.current) {
        commentInputRef.current.focus()
      }

      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch (err) {
      console.error("Error adding comment:", err)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Generate video thumbnail
  const generateVideoThumbnail = (videoUrl: string, videoId: string) => {
    const video = document.createElement('video')
    video.src = videoUrl
    video.crossOrigin = 'anonymous'
    
    // Try multiple timestamps to get the best thumbnail
    const timestamps = [1, 2, 3] // Try at 1s, 2s, and 3s
    let currentTimestampIndex = 0

    const tryNextTimestamp = () => {
      if (currentTimestampIndex < timestamps.length) {
        video.currentTime = timestamps[currentTimestampIndex]
        currentTimestampIndex++
      }
    }

    video.addEventListener('loadeddata', () => {
      tryNextTimestamp()
    })

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8) // Better quality
        setVideoThumbnails(prev => ({
          ...prev,
          [videoId]: thumbnailUrl
        }))
        tryNextTimestamp() // Try next timestamp
      }
    })

    // Handle errors
    video.addEventListener('error', (e) => {
      console.error('Error generating thumbnail:', e)
      setVideoThumbnails(prev => ({
        ...prev,
        [videoId]: '/placeholder.svg'
      }))
    })
  }

  // Generate thumbnails for related videos
  useEffect(() => {
    if (relatedVideos.length > 0) {
      relatedVideos.forEach(video => {
        if (!video.thumbnail_url) {
          generateVideoThumbnail(video.url, video.id)
        }
      })
    }
  }, [relatedVideos])

  if (loading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/videos")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
        </Button>
        <Skeleton className="h-[60vh] w-full rounded-md" />
      </main>
    )
  }

  if (error || !video) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/videos")}>
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
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/videos")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
      </Button>

      <AdvancedVideoPlayer
        video={video}
        onPrevious={relatedVideos.length > 0 ? handlePrevious : undefined}
        onNext={relatedVideos.length > 0 ? handleNext : undefined}
        relatedVideos={relatedVideos}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{video.title}</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1 ${liked ? "text-red-500" : ""}`}
                    onClick={handleLike}
                  >
                    <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                    <span>{likesCount}</span>
                  </Button>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-5 w-5" />
                    <span>{comments.length}</span>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={video.user_image || undefined} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{video.user_name}</p>
                </div>
              </div>

              {video.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">{video.description}</p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="flex gap-3 mb-6">
                  <Avatar>
                    <AvatarImage src={session.user?.image || undefined} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      ref={commentInputRef}
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="resize-none"
                      rows={2}
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleCommentSubmit}
                        disabled={!comment.trim() || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">Sign in to comment</p>
                  <Button onClick={() => router.push("/signin")}>Sign In</Button>
                </div>
              )}

              {commentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-1/4 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id}>
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarImage src={comment.userImage || undefined} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{comment.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Up Next</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {relatedVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex gap-2 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors"
                  onClick={() => router.push(`/videos/${video.id}`)}
                >
                  <div className="relative aspect-video w-40 min-w-[160px] bg-muted rounded overflow-hidden">
                    <img
                      src={video.thumbnail_url || videoThumbnails[video.id] || `/placeholder.svg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <video
                      src={video.url}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 hover:opacity-100 transition-opacity"
                      muted
                      playsInline
                      onMouseOver={(e) => e.currentTarget.play()}
                      onFocus={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => {
                        e.currentTarget.pause()
                        e.currentTarget.currentTime = 0
                      }}
                      onBlur={(e) => {
                        e.currentTarget.pause()
                        e.currentTarget.currentTime = 0
                      }}
                    />
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
    </main>
  )
}
