"use client"

import { useRouter } from "next/navigation"
import PodcastCreator from "@/components/podcast-creator"

export default function NewPodcastPage() {
  const router = useRouter()

  const handleSave = (podcastId: string) => {
    // Redirect to the podcast page after saving
    setTimeout(() => {
      router.push(`/podcasts/${podcastId}`)
    }, 1000)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Create New Podcast</h1>
      <PodcastCreator onSave={handleSave} />
    </main>
  )
}
