"use client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import PodcastList from "@/components/podcast-list"
import { useSession } from "next-auth/react"

export default function PodcastsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  return (
    <main className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">Sailors Podcasts</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">Listen to the latest episodes and stories from the sea.</p>
          <p className="text-base text-gray-500 dark:text-gray-400">Where sailors share their stories, experiences, and voices.</p>
        </div>
        {isAdmin && (
          <Link href="/podcasts/new">
            <Button className="bg-gray-500 hover:bg-gray-700 dark:bg-gray-200 dark:hover:bg-gray-400 dark:text-gray-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md flex items-center gap-2">
              <Plus className="h-5 w-5" />
              New Podcast
            </Button>
          </Link>
        )}
      </div>
      <section>
        <PodcastList />
      </section>
    </main>
  )
}
