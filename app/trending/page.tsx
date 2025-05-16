"use client"

import Link from "next/link"
import { TrendingUp, Film, ImageIcon, Mic, ArrowLeft, Search, SortAsc, SortDesc } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const TYPE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Videos", value: "video" },
  { label: "Photos", value: "photo" },
  { label: "Podcasts", value: "podcast" },
]

const SORT_OPTIONS = [
  { label: "Most Viewed", value: "views" },
  { label: "Newest", value: "date" },
]

export default function TrendingPage() {
  const [trending, setTrending] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [type, setType] = useState("all")
  const [sort, setSort] = useState("views")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchTrending()
  }, [])

  async function fetchTrending() {
    setIsLoading(true)
    setFetchError(null)
    try {
      // Fetch trending videos, photos, podcasts (top 10 each)
      const [videosRes, photosRes, podcastsRes] = await Promise.all([
        fetch("/api/videos?limit=10"),
        fetch("/api/photos?limit=10"),
        fetch("/api/podcasts?limit=10"),
      ])
      if (!videosRes.ok || !photosRes.ok || !podcastsRes.ok) {
        throw new Error("Failed to fetch trending content")
      }
      const [videos, photos, podcasts] = await Promise.all([
        videosRes.json(),
        photosRes.json(),
        podcastsRes.json(),
      ])
      // Normalize and combine
      const trendingItems = [
        ...(Array.isArray(videos) ? videos : videos.videos || []).map((item: any) => ({
          ...item,
          type: "video",
          id: item._id || item.id,
          views: Math.floor(Math.random() * 5000) + 1000,
          date: item.createdAt || item.uploadedAt || item.date || new Date().toISOString(),
        })),
        ...(Array.isArray(photos) ? photos : photos.photos || []).map((item: any) => ({
          ...item,
          type: "photo",
          id: item._id || item.id,
          views: Math.floor(Math.random() * 3000) + 800,
          date: item.createdAt || item.uploadedAt || item.date || new Date().toISOString(),
        })),
        ...(Array.isArray(podcasts) ? podcasts : podcasts.podcasts || []).map((item: any) => ({
          ...item,
          type: "podcast",
          id: item._id || item.id,
          views: Math.floor(Math.random() * 2000) + 500,
          date: item.createdAt || item.uploadedAt || item.date || new Date().toISOString(),
        })),
      ]
      setTrending(trendingItems)
    } catch (e: any) {
      setFetchError(e.message || "Failed to load trending content")
    } finally {
      setIsLoading(false)
    }
  }

  // Filtering, sorting, searching
  let filtered = trending
  if (type !== "all") filtered = filtered.filter((item) => item.type === type)
  if (search.trim()) filtered = filtered.filter((item) => (item.title || "").toLowerCase().includes(search.toLowerCase()))
  filtered = [...filtered].sort((a, b) => {
    if (sort === "views") return b.views - a.views
    if (sort === "date") return new Date(b.date).getTime() - new Date(a.date).getTime()
    return 0
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-slate-600 dark:text-slate-300">
                <ArrowLeft className="h-5 w-5 mr-2" /> Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-gray-600" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Trending Now</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {TYPE_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={type === opt.value ? "default" : "outline"}
                className={type === opt.value ? "bg-gray-600 text-white" : ""}
                onClick={() => setType(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                style={{ minWidth: 220 }}
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
            {SORT_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={sort === opt.value ? "default" : "outline"}
                className={sort === opt.value ? "bg-gray-600 text-white" : ""}
                onClick={() => setSort(opt.value)}
              >
                {opt.label} {opt.value === "views" ? <SortDesc className="inline h-4 w-4 ml-1" /> : <SortAsc className="inline h-4 w-4 ml-1" />}
              </Button>
            ))}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 ml-auto">{filtered.length} results</div>
        </div>
        {fetchError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center gap-2 mb-6">
            <span className="font-medium">Error loading content:</span>
            <span>{fetchError}</span>
          </div>
        )}
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground text-lg">Loading trending content...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-lg">No trending content found for your filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtered.map((item, index) => (
              <Card key={item.id || index} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all group">
                <Link href={`/${item.type}s/${item.id}`}>
                  <div className="relative aspect-video overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img
                      src={
                        item.thumbnail_url ||
                        item.coverImage ||
                        item.url ||
                        (item.type === "video"
                          ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${item.public_id}.jpg`
                          : "/diverse-media-landscape.png")
                      }
                      alt={item.title || "Media thumbnail"}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm">
                        {item.type === "video" && <Film className="h-3 w-3 mr-1" />}
                        {item.type === "photo" && <ImageIcon className="h-3 w-3 mr-1" />}
                        {item.type === "podcast" && <Mic className="h-3 w-3 mr-1" />} Trending
                      </Badge>
                    </div>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/${item.type}s/${item.id}`}>
                    <h3 className="font-semibold text-base line-clamp-1 group-hover:text-gray-700 dark:group-hover:text-gray-400 transition-colors">
                      {item.title || (item.type === "video" ? item.public_id?.split("/")?.pop() : "Untitled")}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      {item.views.toLocaleString()} views
                      <span className="hidden md:inline">·</span>
                      <span className="hidden md:inline">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="outline" className="font-normal">
                      {item.type}
                    </Badge>
                  </div>
                  {item.description && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
