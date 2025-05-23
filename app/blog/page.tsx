"use client"

import { useSession } from "next-auth/react"
import BlogList from "@/components/blog-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isAuthenticated = !!session

  console.log('Session status:', status)
  console.log('Session data:', session)
  console.log('Is authenticated:', isAuthenticated)

  const handleNewBlog = () => {
    console.log('New blog button clicked')
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to /blog/new')
      router.push('/blog/new')
    } else {
      console.log('User is not authenticated')
      alert('Please sign in to create a blog post')
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Blog</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Read and share maritime stories and experiences</p>
        </div>

        {isAuthenticated ? (
          <Button 
            onClick={handleNewBlog}
            className="bg-gray-700 hover:bg-gray-800 text-white font-medium shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> New Blog Post
          </Button>
        ) : (
          <Button 
            onClick={() => router.push('/auth/signin')}
            className="bg-gray-700 hover:bg-gray-800 text-white font-medium shadow-sm"
          >
            Sign in to Create Blog
          </Button>
        )}
      </div>

      <BlogList />
    </div>
  )
}
