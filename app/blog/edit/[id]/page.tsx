"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import BlogEditor from "@/components/blog-editor"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "next-auth/react"

interface Blog {
  id: string
  title: string
  content: string
  cover_image_url?: string
  tags: string[]
  author_id: string
}

export default function EditBlogPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        // Check if user has permission to edit
        const isOwner = data.author_id === session?.user?.id
        const isAdmin = session?.user?.role === 'admin'
        if (!isOwner && !isAdmin) {
          router.push('/blog')
          return
        }
      } catch (err) {
        console.error("Error fetching blog:", err)
        setError(err instanceof Error ? err.message : "Failed to load blog post")
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchBlog()
    }
  }, [params.id, session, router])

  const handleSave = () => {
    // Redirect to the blog post page after saving
    setTimeout(() => {
      router.push(`/blog/${params.id}`)
    }, 1000)
  }

  if (loading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/blog/${params.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Post
        </Button>
        <Skeleton className="h-[600px] w-full rounded-md" />
      </main>
    )
  }

  if (error || !blog) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/blog/${params.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Post
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

  return (
    <main className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-4" onClick={() => router.push(`/blog/${params.id}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Post
      </Button>
      <h1 className="text-3xl font-bold text-center mb-8">Edit Blog Post</h1>
      <BlogEditor initialBlog={blog} onSave={handleSave} />
    </main>
  )
}
