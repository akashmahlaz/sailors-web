"use client"

import { useRouter } from "next/navigation"
import NewsEditor from "@/components/news-editor"

export default function NewNewsPage() {
  const router = useRouter()

  const handleSave = (newsId: string) => {
    // Redirect to the news article page after saving
    setTimeout(() => {
      router.push(`/news/${newsId}`)
    }, 1000)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Create News Article</h1>
      <NewsEditor onSave={handleSave} />
    </main>
  )
}
