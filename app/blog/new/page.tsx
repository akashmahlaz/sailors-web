"use client"

import { useRouter } from "next/navigation"
import BlogEditor from "@/components/blog-editor"

export default function NewBlogPage() {
  const router = useRouter()

  const handleSave = (blogId: string) => {
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
