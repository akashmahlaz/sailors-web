"use client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import NewsList from "@/components/news-list"
import { useSession } from "next-auth/react"

export default function NewsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">Maritime Reports</h1>

        {isAdmin && (
          <Link href="/news/new">
            <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </Link>
        )}
      </div>

      <NewsList />
    </main>
  )
}
