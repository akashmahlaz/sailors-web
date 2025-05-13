"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import NewsEditor from "@/components/news-editor"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface NewsArticle {
  id: string
  title: string
  content: string
  summary: string
  cover_image_url?: string
  author: string
  category: string
  tags: string[]
  is_breaking: boolean
}

export default function EditNewsPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleSave = () => {
    // Redirect to the news article page after saving
    setTimeout(() => {
      router.push(`/news/${params.id}`)
    }, 1000)
  }

  if (loading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/news/${params.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Article
        </Button>
        <Skeleton className="h-[600px] w-full rounded-md" />
      </main>
    )
  }

  if (error || !article) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/news/${params.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Article
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

  return (
    <main className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-4" onClick={() => router.push(`/news/${params.id}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Article
      </Button>
      <h1 className="text-3xl font-bold text-center mb-8">Edit News Article</h1>
      <NewsEditor initialNews={article} onSave={handleSave} />
    </main>
  )
}
