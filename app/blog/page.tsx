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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-900">Sea Blog</h1>
          <p className="text-muted-foreground mt-1">Read and share maritime stories and experiences</p>
        </div>

        {isAuthenticated && (
          <Link href="/blog/new">
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="mr-2 h-4 w-4" /> New Blog Post
            </Button>
          </Link>
        )}
      </div>

      <BlogList />
    </div>
  )
}
