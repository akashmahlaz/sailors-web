"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Trash2, Eye, Download, Edit, BarChart3, Heart } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface ContentItem {
  id: string
  title?: string
  public_id?: string
  url?: string
  thumbnail_url?: string
  created_at: string
  author?: string
  userName?: string
  views?: number
  likes?: number
  comments?: number
}

export default function AdminContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("videos")
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null)
  const [deleteInProgress, setDeleteInProgress] = useState(false)

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  // Fetch content based on active tab
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return

    const fetchContent = async () => {
      setLoading(true)
      setError(null)
      try {
        const endpoint = `/api/admin/${activeTab}`
        const response = await fetch(endpoint)

        if (!response.ok) {
          throw new Error(`Failed to fetch ${activeTab}: ${response.statusText}`)
        }

        const data = await response.json()
        setContent(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err)
        setError(err instanceof Error ? err.message : `Failed to load ${activeTab}`)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [activeTab, session, status])

  const handleDelete = async () => {
    if (!itemToDelete) return

    setDeleteInProgress(true)
    try {
      const endpoint = `/api/admin/${activeTab}/${itemToDelete.id}`
      const response = await fetch(endpoint, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.statusText}`)
      }

      // Remove the deleted item from the list
      setContent(content.filter((item) => item.id !== itemToDelete.id))
      setDeleteDialogOpen(false)
    } catch (err) {
      console.error("Error deleting item:", err)
      setError(err instanceof Error ? err.message : "Failed to delete item")
    } finally {
      setDeleteInProgress(false)
      setItemToDelete(null)
    }
  }

  const filteredContent = content.filter((item) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      false ||
      item.public_id?.toLowerCase().includes(searchLower) ||
      false ||
      item.author?.toLowerCase().includes(searchLower) ||
      false ||
      item.userName?.toLowerCase().includes(searchLower) ||
      false
    )
  })

  if (status === "loading") {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (status === "authenticated" && session?.user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Content Management</h1>
        <Link href="/admin/analytics">
          <Button className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </Link>
      </div>

      <Card className="border-gray-200 shadow-lg shadow-gray-100 dark:border-gray-800 dark:shadow-none mb-6">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          <CardTitle className="text-gray-900 dark:text-gray-100">Content Library</CardTitle>
          <CardDescription>Manage all content across the platform</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="audios">Audio</TabsTrigger>
              <TabsTrigger value="blogs">Blogs</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>
            <div className="mb-6">
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <TabsContent value="videos" className="mt-0">
              <ContentTable
                items={filteredContent}
                loading={loading}
                contentType="videos"
                onDelete={(item) => {
                  setItemToDelete(item)
                  setDeleteDialogOpen(true)
                }}
              />
            </TabsContent>
            <TabsContent value="audios" className="mt-0">
              <ContentTable
                items={filteredContent}
                loading={loading}
                contentType="audios"
                onDelete={(item) => {
                  setItemToDelete(item)
                  setDeleteDialogOpen(true)
                }}
              />
            </TabsContent>
            <TabsContent value="blogs" className="mt-0">
              <ContentTable
                items={filteredContent}
                loading={loading}
                contentType="blogs"
                onDelete={(item) => {
                  setItemToDelete(item)
                  setDeleteDialogOpen(true)
                }}
              />
            </TabsContent>
            <TabsContent value="photos" className="mt-0">
              <ContentTable
                items={filteredContent}
                loading={loading}
                contentType="photos"
                onDelete={(item) => {
                  setItemToDelete(item)
                  setDeleteDialogOpen(true)
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {activeTab.slice(0, -1)}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{itemToDelete?.title || itemToDelete?.public_id}</p>
            {itemToDelete?.thumbnail_url && (
              <div className="mt-2 w-full max-w-xs mx-auto">
                <img
                  src={itemToDelete.thumbnail_url || "/placeholder.svg"}
                  alt={itemToDelete.title || "Content thumbnail"}
                  className="w-full h-auto rounded-md"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteInProgress} className="border-gray-200 dark:border-gray-800">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteInProgress}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteInProgress ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ContentTableProps {
  items: ContentItem[]
  loading: boolean
  contentType: string
  onDelete: (item: ContentItem) => void
}

function ContentTable({ items, loading, contentType, onDelete }: ContentTableProps) {
  console.log("ContentTable:", { items, loading, contentType });
  if (loading) {
    console.log("ContentTable (loading):", { items, loading, contentType });
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Loading {contentType}...</p>
      </div>
    )
  }

  if (items.length === 0) {
    console.log("ContentTable (empty):", { items, loading, contentType });
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No {contentType} found.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden">
      <Tabs>
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-900">
          <TableRow>
            <TableHead className="w-[300px]">Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-center">Stats</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  {item.thumbnail_url && (
                    <img
                      src={item.thumbnail_url || "/placeholder.svg"}
                      alt={item.title || "Thumbnail"}
                      className="w-10 h-10 object-cover rounded-md"
                    />
                  )}
                  <div className="truncate max-w-[200px]">{item.title || item.public_id || "Untitled"}</div>
                </div>
              </TableCell>
              <TableCell>{item.author || item.userName || "Unknown"}</TableCell>
              <TableCell>
                {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : "Unknown"}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" /> {item.views || 0}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Heart className="h-3 w-3 mr-1" /> {item.likes || 0}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild className="border-gray-200 dark:border-gray-800">
                    <Link href={`/${contentType}/${item.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  {contentType === "blogs" && (
                    <Button variant="outline" size="sm" asChild className="border-gray-200 dark:border-gray-800">
                      <Link href={`/blog/edit/${item.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  {item.url && (
                    <Button variant="outline" size="sm" asChild className="border-gray-200 dark:border-gray-800">
                      <a href={item.url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Tabs>
    </div>
  )
}
