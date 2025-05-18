"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Trash2, Edit, Eye } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"
import { ThumbsUp, MessageSquare } from "lucide-react"

interface Content {
  id: string
  title: string
  description: string
  url: string
  thumbnail_url: string
  created_at: string
  views: number
  likes: number
  comments: any[]
}

export default function ContentManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("videos")
  const [content, setContent] = useState<Record<string, Content[]>>({
    videos: [],
    photos: [],
    audio: [],
    blogs: [],
    podcasts: [],
    news: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contentToDelete, setContentToDelete] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserContent(session.user.id)
    }
  }, [session?.user?.id, activeTab])

  const fetchUserContent = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/${activeTab}?userId=${userId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${activeTab}`)
      }

      const data = await response.json()
      const contentArray = Array.isArray(data) ? data : data[activeTab] || []
      
      setContent(prev => ({
        ...prev,
        [activeTab]: contentArray
      }))
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err)
      setError(`Failed to load ${activeTab}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (contentId: string, contentTitle: string) => {
    setContentToDelete({ id: contentId, title: contentTitle })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!contentToDelete) return

    try {
      const response = await fetch(`/api/${activeTab}/${contentToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete content")
      }

      // Update local state
      setContent(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(item => item.id !== contentToDelete.id)
      }))

      toast.success("Content deleted successfully")
    } catch (err) {
      console.error("Error deleting content:", err)
      toast.error("Failed to delete content. Please try again.")
    } finally {
      setDeleteDialogOpen(false)
      setContentToDelete(null)
    }
  }

  const handleViewContent = (contentId: string) => {
    router.push(`/${activeTab}/${contentId}`)
  }

  const handleEditContent = (contentId: string) => {
    router.push(`/${activeTab}/${contentId}/edit`)
  }

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Content Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all your uploaded content in one place
        </p>
      </div>

      {/* Content Type Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {Object.keys(content).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeTab === type
                  ? "bg-slate-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {content[activeTab]?.map((item: any) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video">
              {item.thumbnail_url ? (
                <Image
                  src={item.thumbnail_url}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">No thumbnail</span>
                </div>
              )}
            </div>

            {/* Content Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {item.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{item.views || 0} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{item.likes || 0} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{item.comments || 0} comments</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewContent(item.id)}
                  className="flex-1 px-3 py-1.5 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => handleEditContent(item.id)}
                  className="flex-1 px-3 py-1.5 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(item.id, item.title)}
                  className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {content[activeTab]?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No {activeTab} found</p>
          <button
            onClick={() => {
              // Add navigation to upload page
              window.location.href = `/upload/${activeTab}`
            }}
            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
          >
            Upload {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && contentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Delete Content</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{contentToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 