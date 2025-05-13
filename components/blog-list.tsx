"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw, Heart, MessageSquare, Share2, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BlogPost {
  id: string
  title: string
  content: string
  summary: string
  cover_image_url?: string
  author: string
  author_id: string
  category: string
  tags: string[]
  views: number
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

export default function BlogList() {
  const { data: session } = useSession()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedBlog, setExpandedBlog] = useState<string | null>(null)
  const [likedBlogs, setLikedBlogs] = useState<Record<string, boolean>>({})
  const [commentText, setCommentText] = useState("")

  // Mock comments for demonstration
  const [blogComments, setBlogComments] = useState<Record<string, Comment[]>>({})

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/blogs")

      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.statusText}`)
      }

      const data = await response.json()
      setBlogs(data)

      // Initialize mock comments for each blog
      const initialComments: Record<string, Comment[]> = {}
      data.forEach((blog: BlogPost) => {
        initialComments[blog.id] = [
          {
            id: `comment-${Math.random().toString(36).substr(2, 9)}`,
            text: "Great post! I enjoyed reading about your maritime adventures.",
            author: "Captain Morgan",
            authorImage: "/diverse-avatars.png",
            date: "2 days ago",
            likes: 6,
          },
        ]
      })
      setBlogComments(initialComments)

      setError(null)
    } catch (err) {
      console.error("Error fetching blogs:", err)
      setError(err instanceof Error ? err.message : "Failed to load blog posts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const toggleLike = (blogId: string) => {
    setLikedBlogs((prev) => ({
      ...prev,
      [blogId]: !prev[blogId],
    }))
  }

  const toggleExpand = (blogId: string) => {
    setExpandedBlog((prev) => (prev === blogId ? null : blogId))
  }

  const handleComment = (blogId: string) => {
    if (!commentText.trim()) return

    const newComment: Comment = {
      id: `comment-${Math.random().toString(36).substr(2, 9)}`,
      text: commentText,
      author: session?.user?.name || "Anonymous Sailor",
      authorImage: session?.user?.image || "/diverse-avatars.png",
      date: "Just now",
      likes: 0,
    }

    setBlogComments((prev) => ({
      ...prev,
      [blogId]: [...(prev[blogId] || []), newComment],
    }))

    setCommentText("")
  }

  const likeComment = (blogId: string, commentId: string) => {
    setBlogComments((prev) => {
      const updatedComments = { ...prev }
      const commentIndex = updatedComments[blogId].findIndex((c) => c.id === commentId)

      if (commentIndex !== -1) {
        updatedComments[blogId][commentIndex].likes += 1
      }

      return updatedComments
    })
  }

  const canEditBlog = (blog: BlogPost) => {
    return session?.user?.id === blog.author_id || session?.user?.role === "admin"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>Loading blog posts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-cyan-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b border-cyan-100">
        <div>
          <CardTitle className="text-cyan-900">Sea Blog</CardTitle>
          <CardDescription>
            {blogs.length > 0 ? `${blogs.length} maritime stories to explore` : "No sea stories yet"}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBlogs} disabled={loading} className="border-cyan-200">
          <RefreshCw className="h-4 w-4 mr-2" />
          Scan Horizon
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading blog posts</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {blogs.length === 0 && !error ? (
          <div className="text-center py-8 text-muted-foreground">
            No sea stories yet. Be the first to share your maritime adventures!
          </div>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-gradient-to-b from-white to-cyan-50 rounded-xl overflow-hidden shadow-sm"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {blog.cover_image_url && (
                    <div className="md:w-1/3 h-48 md:h-auto">
                      <img
                        src={blog.cover_image_url || "/placeholder.svg"}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`${blog.cover_image_url ? "md:w-2/3" : "w-full"} p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 border-cyan-200">
                        {blog.category}
                      </Badge>
                    </div>
                    <Link href={`/blog/${blog.id}`}>
                      <h3 className="text-xl font-bold mb-2 text-cyan-900 hover:text-cyan-700 transition-colors">
                        {blog.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground mb-2">{blog.summary}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{blog.author[0]}</AvatarFallback>
                        </Avatar>
                        <span>{blog.author}</span>
                      </div>
                      <span>
                        {new Date(blog.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span>{blog.views} views</span>
                    </div>
                    {blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-cyan-200">
                            {tag}
                          </Badge>
                        ))}
                        {blog.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs border-cyan-200">
                            +{blog.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-cyan-100">
                      <div className="flex space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(blog.id)}
                          className={likedBlogs[blog.id] ? "text-red-500" : "text-gray-500"}
                        >
                          <Heart className="h-4 w-4 mr-2" fill={likedBlogs[blog.id] ? "currentColor" : "none"} />
                          {likedBlogs[blog.id] ? "Liked" : "Like"}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(blog.id)}
                          className="text-gray-500"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Comments ({blogComments[blog.id]?.length || 0})
                        </Button>

                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        {canEditBlog(blog) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/blog/edit/${blog.id}`}>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        <Link href={`/blog/${blog.id}`}>
                          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                            Read More
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {expandedBlog === blog.id && (
                      <div className="mt-4 space-y-4 border-t border-cyan-100 pt-4">
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
                              className="min-h-[80px] border-cyan-200 focus-visible:ring-cyan-500"
                            />
                            <Button
                              onClick={() => handleComment(blog.id)}
                              className="mt-2 bg-cyan-600 hover:bg-cyan-700"
                              disabled={!commentText.trim()}
                            >
                              Post Comment
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {blogComments[blog.id]?.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.authorImage || "/placeholder.svg"} />
                                <AvatarFallback>{comment.author[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{comment.author}</span>
                                  <span className="text-xs text-muted-foreground">{comment.date}</span>
                                </div>
                                <p className="mt-1">{comment.text}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 text-xs text-muted-foreground mt-1"
                                  onClick={() => likeComment(blog.id, comment.id)}
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
