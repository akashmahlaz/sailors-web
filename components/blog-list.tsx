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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null)

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

  const handleDelete = async (blogId: string) => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete blog post")
      }

      // Remove the deleted blog from the list
      setBlogs((prev) => prev.filter((blog) => blog.id !== blogId))
      setDeleteDialogOpen(false)
      setBlogToDelete(null)
    } catch (err) {
      console.error("Error deleting blog:", err)
      setError(err instanceof Error ? err.message : "Failed to delete blog post")
    }
  }

  const openDeleteDialog = (blogId: string) => {
    setBlogToDelete(blogId)
    setDeleteDialogOpen(true)
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
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false)
              setBlogToDelete(null)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blogToDelete && handleDelete(blogToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="border border-gray-200 shadow-md dark:border-gray-800 dark:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div>
            <CardTitle className="text-gray-900 dark:text-gray-100">Blog</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {blogs.length > 0 ? `${blogs.length} stories to explore` : "No stories yet"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchBlogs} disabled={loading} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-4 bg-gray-50 dark:bg-gray-950">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-gray-900 text-red-800 dark:text-red-400 rounded-md flex items-start gap-2 border border-red-200 dark:border-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error loading blog posts</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {blogs.length === 0 && !error ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              No stories yet. Be the first to share your maritime Blog!
            </div>
          ) : (
            <div className="space-y-6">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {blog.cover_image_url && (
                      <div className="md:w-1/3 h-48 md:h-auto">
                        <img
                          src={blog.cover_image_url || "/placeholder.svg"}
                          alt={blog.title}
                          className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                        />
                      </div>
                    )}
                    <div className={`${blog.cover_image_url ? "md:w-2/3" : "w-full"} p-4`}> 
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                            {blog.category}
                          </Badge>
                        </div>
                        {canEditBlog(blog) && (
                          <div className="flex gap-2">
                            <Link href={`/blog/edit/${blog.id}`}>
                              <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Button>
                            </Link>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => openDeleteDialog(blog.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </div>
                        )}
                      </div>
                      <Link href={`/blog/${blog.id}`}>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          {blog.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{blog.summary}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
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
                            <Badge key={tag} variant="outline" className="text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                              +{blog.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(blog.id)}
                            className={
                              (likedBlogs[blog.id] ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400") +
                              " hover:bg-gray-100 dark:hover:bg-gray-800"
                            }
                          >
                            <Heart className="h-4 w-4 mr-2" fill={likedBlogs[blog.id] ? "currentColor" : "none"} />
                            {likedBlogs[blog.id] ? "Liked" : "Like"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(blog.id)}
                            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Comments ({blogComments[blog.id]?.length || 0})
                          </Button>

                          <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          {canEditBlog(blog) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="19" cy="12" r="1" />
                                    <circle cx="5" cy="12" r="1" />
                                  </svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
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
                            <Button size="sm" className="bg-gray-700 hover:bg-gray-800 text-white font-medium shadow-sm">
                              Read More
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {expandedBlog === blog.id && (
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
                                onClick={() => handleComment(blog.id)}
                                className="mt-2 bg-gray-700 hover:bg-gray-800 text-white"
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
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{comment.author}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{comment.date}</span>
                                  </div>
                                  <p className="mt-1 text-gray-800 dark:text-gray-200">{comment.text}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-gray-500 dark:text-gray-400 mt-1 hover:bg-gray-100 dark:hover:bg-gray-800"
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
    </>
  )
}
