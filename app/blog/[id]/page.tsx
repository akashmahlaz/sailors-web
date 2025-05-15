"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, Calendar, User, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface Blog {
  id: string
  title: string
  content: string
  cover_image_url?: string
  author: string
  tags: string[]
  created_at: string
  updated_at: string
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/blogs/${params.id}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch blog: ${response.statusText}`)
        }

        const data = await response.json()
        setBlog(data)
      } catch (err) {
        console.error("Error fetching blog:", err)
        setError(err instanceof Error ? err.message : "Failed to load blog post")
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [params.id])

  const deleteBlog = async () => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return
    }

    try {
      setDeleting(true)
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete blog post")
      }

      router.push("/blog")
    } catch (err) {
      console.error("Error deleting blog:", err)
      setError(err instanceof Error ? err.message : "Failed to delete blog post")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/blog")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
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

  if (error || !blog) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/blog")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error || "Blog post not found"}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Format the date
  const formattedDate = new Date(blog.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Format the content with paragraphs
  const formattedContent = blog.content.split("\n").map((paragraph, index) => (
    <p key={index} className="mb-4">
      {paragraph}
    </p>
  ))

  return (
    <main className="container mx-auto py-10 px-4 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" className="text-gray-700 dark:text-gray-300" onClick={() => router.push("/blog")}> 
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
        </Button>
        <div className="flex gap-2">
          <Link href={`/blog/edit/${blog.id}`}>
            <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={deleteBlog} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" /> {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {blog.cover_image_url && (
        <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg mb-8">
          <img
            src={blog.cover_image_url || "/placeholder.svg"}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">{blog.title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 mb-8">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {formattedDate}
        </span>
        <span className="flex items-center gap-1">
          <User className="h-4 w-4" />
          {blog.author}
        </span>
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {blog.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200">{formattedContent}</div>
    </main>
  )
}
