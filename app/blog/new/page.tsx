"use client"

import { useRouter } from "next/navigation"
import BlogEditor from "@/components/blog-editor"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

export default function NewBlogPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  console.log('New Blog Page - Session status:', status)
  console.log('New Blog Page - Session data:', session)

  useEffect(() => {
    console.log('New Blog Page - Effect running')
    // Redirect unauthenticated users
    if (!session) {
      console.log('User is not authenticated, redirecting to /blog')
      router.push('/blog')
    }
  }, [session, router])

  const handleSave = (blogId: string) => {
    console.log('Blog saved, redirecting to:', `/blog/${blogId}`)
    // Redirect to the blog post page after saving
    setTimeout(() => {
      router.push(`/blog/${blogId}`)
    }, 1000)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Create New Blog Post</h1>
      <BlogEditor onSave={handleSave} />
    </main>
  )
}
