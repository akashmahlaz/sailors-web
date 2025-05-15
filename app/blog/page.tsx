"use client"

import { useSession } from "next-auth/react"
import BlogList from "@/components/blog-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function BlogPage() {
  const { data: session } = useSession()
  const isAuthenticated = !!session

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Blog</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Read and share maritime stories and experiences</p>
        </div>

        {isAuthenticated && (
          <Link href="/blog/new">
            <Button className="bg-gray-700 hover:bg-gray-800 text-white font-medium shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> New Blog Post
            </Button>
          </Link>
        )}
      </div>

      <BlogList />
    </div>
  )
}
