"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw, Mic, Heart, MessageSquare, Share2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

interface Podcast {
  id: string
  title: string
  description: string
  host: string
  cover_image_url?: string
  categories: string[]
  episode_count: number
  created_at: string
  updated_at: string
}

interface Comment {
  id: string
  text: string
  author: string
  authorImage?: string
  date: string
  likes: number
}

export default function PodcastList() {
  const { data: session } = useSession()
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPodcast, setExpandedPodcast] = useState<string | null>(null)
  const [likedPodcasts, setLikedPodcasts] = useState<Record<string, boolean>>({})
  const [commentText, setCommentText] = useState("")

  // Mock comments for demonstration
  const [podcastComments, setPodcastComments] = useState<Record<string, Comment[]>>({})

  const fetchPodcasts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/podcasts")

      if (!response.ok) {
        throw new Error(`Failed to fetch podcasts: ${response.statusText}`)
      }

      const data = await response.json()
      setPodcasts(data)

      // Initialize mock comments for each podcast
      const initialComments: Record<string, Comment[]> = {}
      data.forEach((podcast: Podcast) => {
        initialComments[podcast.id] = [
          {
            id: `comment-${Math.random().toString(36).substr(2, 9)}`,
            text: "I love this sea wave! The stories are captivating.",
            author: "Captain Morgan",
            authorImage: "/diverse-avatars.png",
            date: "2 days ago",
            likes: 4,
          },
        ]
      })
      setPodcastComments(initialComments)

      setError(null)
    } catch (err) {
      console.error("Error fetching podcasts:", err)
      setError(err instanceof Error ? err.message : "Failed to load podcasts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPodcasts()
  }, [])

  const toggleLike = (podcastId: string) => {
    setLikedPodcasts((prev) => ({
      ...prev,
      [podcastId]: !prev[podcastId],
    }))
  }

  const toggleExpand = (podcastId: string) => {
    setExpandedPodcast((prev) => (prev === podcastId ? null : podcastId))
  }

  const handleComment = (podcastId: string) => {
    if (!commentText.trim()) return

    const newComment: Comment = {
      id: `comment-${Math.random().toString(36).substr(2, 9)}`,
      text: commentText,
      author: session?.user?.name || "Anonymous Sailor",
      authorImage: session?.user?.image || "/diverse-avatars.png",
      date: "Just now",
      likes: 0,
    }

    setPodcastComments((prev) => ({
      ...prev,
      [podcastId]: [...(prev[podcastId] || []), newComment],
    }))

    setCommentText("")
  }

  const likeComment = (podcastId: string, commentId: string) => {
    setPodcastComments((prev) => {
      const updatedComments = { ...prev }
      const commentIndex = updatedComments[podcastId].findIndex((c) => c.id === commentId)

      if (commentIndex !== -1) {
        updatedComments[podcastId][commentIndex].likes += 1
      }

      return updatedComments
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Podcasts</CardTitle>
          <CardDescription>Loading podcasts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-24 w-24 rounded-md flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-md dark:border-gray-800 dark:shadow-none">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div>
          <CardTitle className="text-gray-900 dark:text-gray-100">Podcasts</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {podcasts.length > 0 ? `${podcasts.length} podcasts available` : "No podcasts yet"}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPodcasts} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="p-4 bg-gray-50 dark:bg-gray-950">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-gray-900 text-red-800 dark:text-red-400 rounded-md flex items-start gap-2 border border-red-200 dark:border-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading podcasts</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {podcasts.length === 0 && !error ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">No podcasts yet. Check back later!</div>
        ) : (
          <div className="space-y-6">
            {podcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="p-4">
                  <div className="flex gap-4">
                    {podcast.cover_image_url ? (
                      <img
                        src={podcast.cover_image_url || "/placeholder.svg"}
                        alt={podcast.title}
                        className="h-24 w-24 object-cover rounded-md flex-shrink-0 shadow-md"
                      />
                    ) : (
                      <div className="h-24 w-24 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0 shadow-md">
                        <Mic className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link href={`/podcasts/${podcast.id}`}>
                        <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          {podcast.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-700 dark:text-gray-400">Hosted by {podcast.host}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{podcast.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                          {podcast.episode_count} episodes
                        </Badge>
                        {podcast.categories.slice(0, 2).map((category) => (
                          <Badge key={category} variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(podcast.id)}
                        className={
                          (likedPodcasts[podcast.id] ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400") +
                          " hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                      >
                        <Heart className="h-4 w-4 mr-2" fill={likedPodcasts[podcast.id] ? "currentColor" : "none"} />
                        {likedPodcasts[podcast.id] ? "Liked" : "Like"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(podcast.id)}
                        className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comments ({podcastComments[podcast.id]?.length || 0})
                      </Button>

                      <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200"
                        onClick={() => window.open(`/podcasts/${podcast.id}`, '_blank')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Link href={`/podcasts/${podcast.id}`}>
                        <Button size="sm" className="bg-gray-700 hover:bg-gray-800 text-white font-medium shadow-sm">
                          Listen
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {expandedPodcast === podcast.id && (
                    <div className="mt-4 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={session?.user?.image || "/placeholder.svg?height=40&width=40&query=avatar"}
                          />
                          <AvatarFallback>{session?.user?.name?.[0] || "S"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="min-h-[80px] border-gray-200 dark:border-gray-700 focus-visible:ring-gray-500 dark:focus-visible:ring-gray-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          />
                          <Button
                            onClick={() => handleComment(podcast.id)}
                            className="mt-2 bg-gray-700 hover:bg-gray-800 text-white"
                            disabled={!commentText.trim()}
                          >
                            Post Comment
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {podcastComments[podcast.id]?.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.authorImage || "/placeholder.svg"} />
                              <AvatarFallback>{comment.author[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900 dark:text-gray-100">{comment.author}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{comment.date}</span>
                              </div>
                              <p className="mt-1 text-gray-800 dark:text-gray-200">{comment.text}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-gray-500 dark:text-gray-400 mt-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={() => likeComment(podcast.id, comment.id)}
                              >
                                <Heart className="h-3 w-3 mr-1" /> {comment.likes}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
