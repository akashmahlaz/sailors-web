"use client"

import { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw, MoreVertical, Eye, Clock, Search, Film, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSession } from "next-auth/react"
import { useNotifications } from "@/hooks/use-notifications"
import { cn } from "@/lib/utils"
import HoverVideoPlayer from 'react-hover-video-player'
import { motion } from "framer-motion"

interface Video {
  id: string
  _id?: string
  public_id: string
  url: string
  thumbnail_url?: string
  title?: string
  description?: string
  views?: number
  likes?: number
  comments?: number
  created_at: string
  user?: {
    id: string
    name: string
    image?: string
  }
  userId?: string
  userName?: string
  userImage?: string
}

export interface VideoGalleryRef {
  fetchVideos: () => Promise<void>
}

interface VideoGalleryProps {
  limit?: number
  showSearch?: boolean
  showFilters?: boolean
  userId?: string
  horizontal?: boolean
  className?: string
}

const VideoGallery = forwardRef<VideoGalleryRef, VideoGalleryProps>(
  ({ limit = 10, showSearch = true, showFilters = true, userId, horizontal = false, className }, ref) => {
    const { data: session } = useSession()
    const { addNotification } = useNotifications()
    const [videos, setVideos] = useState<Video[]>([])
    const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [sort, setSort] = useState<"newest" | "popular" | "oldest">("newest")

    const fetchVideos = useCallback(async () => {
      try {
        setLoading(true)
        const url = `/api/videos?${new URLSearchParams({
          limit: limit.toString(),
          ...(userId && { userId })
        })}`

        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch videos: ${response.statusText}`)

        const data = await response.json()
        const videoList = Array.isArray(data) ? data : data.videos || []

        setVideos(videoList.map(enrichVideoData))
        applyFilters(videoList, searchQuery, sort)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos")
      } finally {
        setLoading(false)
      }
    }, [limit, userId, searchQuery, sort])

    const enrichVideoData = (video: any): Video => ({
      ...video,
      id: video.id || video._id,
      _id: video._id || video.id,
      title: video.title || video.public_id.split("/").pop() || "Untitled Video",
      description: video.description || "No description provided",
      views: video.views || Math.floor(Math.random() * 1000),
      likes: video.likes || Math.floor(Math.random() * 100),
      comments: video.comments || Math.floor(Math.random() * 20),
      userId: video.userId || video.user?.id,
      userName: video.userName || video.user?.name || "Anonymous Sailor",
      userImage: video.userImage || video.user?.image,
    })

    const applyFilters = (videoList: Video[], query: string, sortBy: string) => {
      const filtered = videoList
        .filter(video => 
          video.title?.toLowerCase().includes(query.toLowerCase()) ||
          video.description?.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => {
          switch (sortBy) {
            case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            case "popular": return (b.views || 0) - (a.views || 0)
            default: return 0
          }
        })

      setFilteredVideos(filtered)
    }

    useImperativeHandle(ref, () => ({ fetchVideos }))

    useEffect(() => { fetchVideos() }, [fetchVideos])
    useEffect(() => { applyFilters(videos, searchQuery, sort) }, [searchQuery, sort, videos])

    const formatDuration = (seconds: number) =>
      new Date(seconds * 1000).toISOString().substring(14, 19)

    const formatTimeAgo = (dateString: string) => {
      const formatter = new Intl.RelativeTimeFormat('en', { style: 'short' })
      const diff = Date.now() - new Date(dateString).getTime()
      
      const intervals = [
        { label: 'year', ms: 31536000000 },
        { label: 'month', ms: 2628000000 },
        { label: 'day', ms: 86400000 },
        { label: 'hour', ms: 3600000 },
        { label: 'minute', ms: 60000 }
      ]

      for (const { label, ms } of intervals) {
        const interval = Math.floor(diff / ms)
        if (interval > 0) return formatter.format(-interval, label as Intl.RelativeTimeFormatUnit)
      }
      
      return 'Just now'
    }

    if (loading && !videos.length) {
      return (
        <div className={cn("space-y-4", className)}>
          {showSearch && <Skeleton className="h-10 w-full rounded-lg" />}
          <div className={cn(
            "grid gap-4",
            horizontal ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-0">
                  <Skeleton className="aspect-video w-full rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-2 items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className={className}>
        {showSearch && (
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-opacity group-focus-within:opacity-0" />
              <Input
                placeholder="Search sea stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl h-11 focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {showFilters && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl h-11 px-4">
                    Sort: {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl w-48">
                  <DropdownMenuLabel>Sort Stories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSort("newest")} className="cursor-pointer">
                    Newest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("oldest")} className="cursor-pointer">
                    Oldest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort("popular")} className="cursor-pointer">
                    Most Popular
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={fetchVideos}
              disabled={loading}
              className="rounded-xl h-11 w-11"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {!filteredVideos.length && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl"
          >
            <div className="mb-4 text-slate-400 dark:text-slate-600">
              <Film className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Calm Waters Ahead</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery ? "No voyages match your search" : "Chart your first voyage to begin the journey"}
            </p>
            {searchQuery ? (
              <Button onClick={() => setSearchQuery("")} className="rounded-xl">
                Clear Search
              </Button>
            ) : (
              <Link href="/upload">
                <Button className="rounded-xl">Share Your Story</Button>
              </Link>
            )}
          </motion.div>
        )}

        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-6 justify-center w-full",
            className
          )}
        >
          {filteredVideos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <Card className="group relative border-none shadow-lg hover:shadow-2xl transition-all overflow-hidden bg-white dark:bg-slate-900 w-[90%] rounded-xl">
                <CardContent className="p-0">
                  <Link href={`/videos/${video.id}`} className="block">
                    <div className="aspect-video relative overflow-hidden rounded-xl w-full">
                      <HoverVideoPlayer
                        videoSrc={video.url}
                        pausedOverlay={
                          <Image
                            src={video.thumbnail_url || `/placeholder.svg`}
                            alt={video.title || 'Video thumbnail'}
                            fill
                            className="object-cover transition-transform"
                          />
                        }
                        overlayTransitionDuration={200}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                        {formatDuration(Math.floor(Math.random() * 600))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                          <Play className="h-8 w-8 text-white fill-white/80" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="p-3">
                    <div className="flex gap-3">
                      <Link href={`/profile/${video.userId}`} className="flex-shrink-0">
                        <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                          <AvatarImage src={video.userImage} />
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                            {video.userName?.[0] || "S"}
                          </AvatarFallback>
                        </Avatar>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/videos/${video.id}`} className="block">
                          <h3 className="font-semibold line-clamp-2 text-sm leading-tight mb-1 text-slate-900 dark:text-slate-100">
                            {video.title}
                          </h3>
                        </Link>

                        <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 space-x-2">
                          <Link 
                            href={`/profile/${video.userId}`}
                            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                          >
                            {video.userName}
                          </Link>
                          <span className="text-slate-400">•</span>
                          <span className="flex items-center">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            {new Intl.NumberFormat().format(video.views || 0)}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>{formatTimeAgo(video.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }
)

VideoGallery.displayName = "VideoGallery"

export default VideoGallery
