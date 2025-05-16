"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw, Filter, Heart, MessageSquare, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string
  cover_image_url?: string
  author: string
  category: string
  tags: string[]
  is_breaking: boolean
  views: number
  created_at: string
  published_at: string
}

interface Comment {
  id: string
  text: string
  author: string
  authorImage?: string
  date: string
  likes: number
}

const NEWS_CATEGORIES = [
  "World",
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Health",
  "Sports",
  "Entertainment",
  "Education",
  "Environment",
]

export default function NewsList() {
  const { data: session } = useSession()
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showBreakingOnly, setShowBreakingOnly] = useState(false)
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({})
  const [commentText, setCommentText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ARTICLES_PER_PAGE = 8

  // Mock comments for demonstration
  const [articleComments, setArticleComments] = useState<Record<string, Comment[]>>({})

  const fetchNews = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      if (selectedCategory) {
        params.append("category", selectedCategory)
      }
      if (showBreakingOnly) {
        params.append("breaking", "true")
      }

      const queryString = params.toString() ? `?${params.toString()}` : ""
      const response = await fetch(`/api/news${queryString}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`)
      }

      const data = await response.json()
      setNews(data)

      // Initialize mock comments for each article
      const initialComments: Record<string, Comment[]> = {}
      data.forEach((article: NewsArticle) => {
        initialComments[article.id] = [
          {
            id: `comment-${Math.random().toString(36).substr(2, 9)}`,
            text: "This report is very informative. Thanks for sharing!",
            author: "Captain Morgan",
            authorImage: "/diverse-avatars.png",
            date: "2 days ago",
            likes: 3,
          },
        ]
      })
      setArticleComments(initialComments)

      setError(null)
    } catch (err) {
      console.error("Error fetching news:", err)
      setError(err instanceof Error ? err.message : "Failed to load news articles")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [selectedCategory, showBreakingOnly])

  const toggleLike = (articleId: string) => {
    setLikedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }))
  }

  const toggleExpand = (articleId: string) => {
    setExpandedArticle((prev) => (prev === articleId ? null : articleId))
  }

  const handleComment = (articleId: string) => {
    if (!commentText.trim()) return

    const newComment: Comment = {
      id: `comment-${Math.random().toString(36).substr(2, 9)}`,
      text: commentText,
      author: session?.user?.name || "Anonymous Sailor",
      authorImage: session?.user?.image || "/diverse-avatars.png",
      date: "Just now",
      likes: 0,
    }

    setArticleComments((prev) => ({
      ...prev,
      [articleId]: [...(prev[articleId] || []), newComment],
    }))

    setCommentText("")
  }

  const likeComment = (articleId: string, commentId: string) => {
    setArticleComments((prev) => {
      const updatedComments = { ...prev }
      const commentIndex = updatedComments[articleId].findIndex((c) => c.id === commentId)

      if (commentIndex !== -1) {
        updatedComments[articleId][commentIndex].likes += 1
      }

      return updatedComments
    })
  }

  const totalPages = Math.ceil(news.length / ARTICLES_PER_PAGE)
  const paginatedNews = news.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News</CardTitle>
          <CardDescription>Loading news articles...</CardDescription>
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
    <Card className="border border-gray-200 shadow-md dark:border-gray-800 dark:shadow-none">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div>
          <CardTitle className="text-gray-900 dark:text-gray-100">Maritime Reports</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {news.length > 0 ? `${news.length} maritime reports available` : "No maritime reports yet"}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                <Filter className="h-4 w-4 mr-2" />
                Filter 
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedCategory === null}
                onCheckedChange={() => setSelectedCategory(null)}
              >
                All Categories
              </DropdownMenuCheckboxItem>
              {NEWS_CATEGORIES.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategory === category}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategory(category)
                    } else if (selectedCategory === category) {
                      setSelectedCategory(null)
                    }
                  }}
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showBreakingOnly}
                onCheckedChange={(checked) => setShowBreakingOnly(checked)}
              >
                Breaking News Only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
           
           {/* Refress button Scan Horizon*/}
          <Button variant="outline" size="sm" onClick={() => fetchNews()} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
            <RefreshCw className="h-4 w-2 mr-2" />  
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 bg-gray-50 dark:bg-gray-950">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-gray-900 text-red-800 dark:text-red-400 rounded-md flex items-start gap-2 border border-red-200 dark:border-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading news</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {news.length === 0 && !error ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            No maritime reports yet. Check back later for updates!
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedNews.map((article) => (
              <div
                key={article.id}
                className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {article.cover_image_url && (
                    <div className="md:w-1/3 h-48 md:h-auto">
                      <img
                        src={article.cover_image_url || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                      />
                    </div>
                  )}
                  <div className={`${article.cover_image_url ? "md:w-2/3" : "w-full"} p-4`}> 
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                        {article.category}
                      </Badge>
                      {article.is_breaking && <Badge variant="destructive" className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700">Breaking</Badge>}
                    </div>
                    <Link href={`/news/${article.id}`}>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">{article.summary}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>By {article.author}</span>
                      <span>
                        {new Date(article.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span>{article.views} views</span>
                    </div>
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            {tag}
                          </Badge>
                        ))}
                        {article.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            +{article.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(article.id)}
                          className={
                            (likedArticles[article.id] ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400") +
                            " hover:bg-gray-100 dark:hover:bg-gray-800"
                          }
                        >
                          <Heart className="h-4 w-4 mr-2" fill={likedArticles[article.id] ? "currentColor" : "none"} />
                          {likedArticles[article.id] ? "Liked" : "Like"}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(article.id)}
                          className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Comments ({articleComments[article.id]?.length || 0})
                        </Button>

                        <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      <Link href={`/news/${article.id}`}>
                        <Button size="sm" className="bg-gray-700 hover:bg-gray-800 text-white font-medium shadow-sm">
                          Read More
                        </Button>
                      </Link>
                    </div>

                    {expandedArticle === article.id && (
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
                              onClick={() => handleComment(article.id)}
                              className="mt-2 bg-gray-700 hover:bg-gray-800 text-white"
                              disabled={!commentText.trim()}
                            >
                              Post Comment
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {articleComments[article.id]?.map((comment) => (
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
                                  onClick={() => likeComment(article.id, comment.id)}
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
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded">
                  Page {currentPage} of {totalPages}
                </span>
                <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200">
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
