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
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sailors Podcasts</h1>
        <h2 className="text-gray-600 dark:text-gray-400">Listen to the latest episodes</h2>
        <h3 className="text-gray-600 dark:text-gray-400">Sailors podcast where sailors share their stories, Experiences and voice</h3>

        {isAdmin && (
          <Link href="/podcasts/new">
            <Button className="bg-gray-600 hover:bg-gray-700 dark:bg-white dark:hover:bg-gray-300 dark:text-black">
              <Plus className="h-4 w-4 mr-2" />
              New Podcast
            </Button>
          </Link>
        )}
      </div>

      <PodcastList />
    </main>
  )
}
