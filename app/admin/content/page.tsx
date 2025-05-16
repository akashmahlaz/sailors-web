"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Trash2, Eye, Download, Edit, BarChart3, Heart, AlertTriangle } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
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
        let endpoint = `/api/admin/${activeTab}`
        if (activeTab === "news" || activeTab === "podcasts") {
          endpoint = `/api/${activeTab}`
        }
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
      let endpoint = `/api/admin/${activeTab}/${itemToDelete.id}`
      if (activeTab === "news") {
        endpoint = `/api/news/${itemToDelete.id}`
      } else if (activeTab === "podcasts") {
        endpoint = `/api/admin/podcasts?id=${itemToDelete.id}`
      }
      const response = await fetch(endpoint, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.statusText}`)
      }
      setContent(content.filter((item) => item.id !== itemToDelete.id))
      setDeleteDialogOpen(false)
      toast({
        title: "Deleted successfully",
        description: `${activeTab.slice(0, -1).toUpperCase()} deleted.`,
        variant: "default",
      })
    } catch (err) {
      console.error("Error deleting item:", err)
      setError(err instanceof Error ? err.message : "Failed to delete item")
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Failed to delete item",
        variant: "destructive",
      })
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
          <div className="overflow-x-auto pb-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-[700px]">
              <TabsList className="grid grid-cols-6 w-full gap-2 mb-4 sticky top-0 z-10 bg-gray-50 dark:bg-gray-900">
                <TabsTrigger value="videos" className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                  <BarChart3 className="h-4 w-4" /> Videos
                </TabsTrigger>
                <TabsTrigger value="audios" className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                  <Heart className="h-4 w-4" /> Audio
                </TabsTrigger>
                <TabsTrigger value="blogs" className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                  <Edit className="h-4 w-4" /> Blogs
                </TabsTrigger>
                <TabsTrigger value="photos" className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                  <Download className="h-4 w-4" /> Photos
                </TabsTrigger>
                <TabsTrigger value="news" className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                  <AlertCircle className="h-4 w-4" /> News
                </TabsTrigger>
                <TabsTrigger value="podcasts" className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                  <Trash2 className="h-4 w-4" /> Podcasts
                </TabsTrigger>
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
              <TabsContent value="news" className="mt-0">
                <ContentTable
                  items={filteredContent}
                  loading={loading}
                  contentType="news"
                  onDelete={(item) => {
                    setItemToDelete(item)
                    setDeleteDialogOpen(true)
                  }}
                />
              </TabsContent>
              <TabsContent value="podcasts" className="mt-0">
                <ContentTable
                  items={filteredContent}
                  loading={loading}
                  contentType="podcasts"
                  onDelete={(item) => {
                    setItemToDelete(item)
                    setDeleteDialogOpen(true)
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <DialogTitle>Confirm Deletion</DialogTitle>
            </div>
            <DialogDescription>
              <span className="font-semibold text-red-700">Warning:</span> This action cannot be undone.<br />
              Are you sure you want to delete this {activeTab.slice(0, -1)}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center">
            {itemToDelete?.thumbnail_url && (
              <div className="mt-2 w-full max-w-xs mx-auto">
                <img
                  src={itemToDelete.thumbnail_url || "/placeholder.svg"}
                  alt={itemToDelete.title || "Content thumbnail"}
                  className="w-full h-auto rounded-md border border-gray-200 shadow"
                />
              </div>
            )}
            <p className="font-bold text-lg mt-4 mb-2 text-gray-900 dark:text-gray-100">{itemToDelete?.title || itemToDelete?.public_id}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteInProgress} className="border-gray-200 dark:border-gray-800">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteInProgress}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 min-w-[110px]"
            >
              {deleteInProgress && <span className="loader border-white"></span>}
              {deleteInProgress ? "Deleting..." : <><Trash2 className="h-4 w-4" /> Delete</>}
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
            <TableRow key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-900/70 transition-colors">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  {item.thumbnail_url && (
                    <img
                      src={item.thumbnail_url || "/placeholder.svg"}
                      alt={item.title || "Thumbnail"}
                      className="w-10 h-10 object-cover rounded-md border border-gray-200"
                    />
                  )}
                  <div className="truncate max-w-[200px]">{item.title || item.public_id || "Untitled"}</div>
                </div>
              </TableCell>
              <TableCell>{item.author || item.userName || <span className="text-gray-400">Unknown</span>}</TableCell>
              <TableCell>
                {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : <span className="text-gray-400">Unknown</span>}
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
                    className="bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border-red-200 flex items-center gap-1 min-w-[90px]"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* Add this CSS for loader spinner */
<style jsx>{`
  .loader {
    border: 2px solid #f3f3f3;
    border-top: 2px solid #fff;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`}</style>
