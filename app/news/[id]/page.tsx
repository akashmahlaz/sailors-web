"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, Calendar, User, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

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
  media_items?: any[]
}

export default function NewsDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/news/${params.id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch article: ${response.statusText}`)
        }

        const data = await response.json()
        setArticle(data)
      } catch (err) {
        console.error("Error fetching article:", err)
        setError(err instanceof Error ? err.message : "Failed to load news article")
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.id])

  const deleteArticle = async () => {
    if (!confirm("Are you sure you want to delete this news article?")) {
      return
    }

    try {
      setDeleting(true)
      const response = await fetch(`/api/news/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete news article")
      }

      router.push("/news")
    } catch (err) {
      console.error("Error deleting article:", err)
      setError(err instanceof Error ? err.message : "Failed to delete news article")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/news")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
        </Button>
        <Skeleton className="h-64 w-full rounded-md mb-4" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/4 mb-8" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </main>
    )
  }

  if (error || !article) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/news")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error || "News article not found"}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Format the date
  const formattedDate = new Date(article.published_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Format the content with paragraphs
  const formattedContent = article.content.split("\n").map((paragraph, index) => (
    <p key={index} className="mb-4">
      {paragraph}
    </p>
  ))

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={() => router.push("/news")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
        </Button>
        <div className="flex gap-2">
          <Link href={`/news/edit/${article.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={deleteArticle} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" /> {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {article.is_breaking && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-md mb-4 font-bold text-center">BREAKING NEWS</div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Badge>{article.category}</Badge>
          <div className="flex items-center text-muted-foreground text-sm">
            <Eye className="h-4 w-4 mr-1" />
            {article.views} views
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {article.author}
          </span>
        </div>

        {article.cover_image_url && (
          <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg mb-8">
            <img
              src={article.cover_image_url || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="text-lg font-medium italic mb-8">{article.summary}</div>

        <div className="prose prose-lg max-w-none">{formattedContent}</div>

        {article.media_items && article.media_items.length > 0 && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold">Additional Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {article.media_items.map((item: any, index: number) => (
                <div key={index} className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">
                    {item.title ||
                      `${item.resourceType.charAt(0).toUpperCase() + item.resourceType.slice(1)} ${index + 1}`}
                  </h3>

                  {item.resourceType === "image" ? (
                    <img
                      src={item.url || "/placeholder.svg"}
                      alt={item.title || "Media"}
                      className="w-full rounded-md"
                    />
                  ) : item.resourceType === "video" ? (
                    <video src={item.url} className="w-full rounded-md" controls />
                  ) : (
                    <audio src={item.url} className="w-full mt-2" controls />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-8">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
