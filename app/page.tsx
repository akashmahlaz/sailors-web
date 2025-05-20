"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Film,
  ImageIcon,
  Mic,
  ArrowRight,
  Play,
  Users,
  Anchor,
  Compass,
  Tv,
  BookOpen,
  Ship,
  Newspaper,
  Upload,
  Crown,
  TrendingUp,
  CloudLightningIcon as Lightning,
  Radio,
  AlertCircle,
  Sparkles,
  Sailboat,
  Group,
  UserCircle2,
  MicVocal,
  UserCircle
} from "lucide-react"

import VideoGallery from "@/components/video-gallery"

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Home() {
  const galleryRef = useRef<{ fetchVideos: () => Promise<void> } | null>(null)
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user

  const [latestVideos, setLatestVideos] = useState<any[]>([])
  const [latestPhotos, setLatestPhotos] = useState<any[]>([])
  const [latestPodcasts, setLatestPodcasts] = useState<any[]>([])
  const [featuredSailors, setFeaturedSailors] = useState<any[]>([])
  const [trendingContent, setTrendingContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [trendingHover, setTrendingHover] = useState<number | null>(null)

  useEffect(() => {
    fetchLatestContent()
  }, [])

  // Fetch trending content for homepage trending section
  useEffect(() => {
    fetchTrendingContent()
  }, [latestVideos, latestPhotos, latestPodcasts])

  const fetchLatestContent = async () => {
    setIsLoading(true)
    setFetchError(null)

    try {
      console.log("Home: Fetching latest content")

      // Fetch latest videos
      try {
        console.log("Home: Fetching videos")
        const videosRes = await fetch("/api/videos?limit=8")

        if (!videosRes.ok) {
          console.error(`Home: Failed to fetch videos: ${videosRes.status} ${videosRes.statusText}`)
          throw new Error(`Failed to fetch videos: ${videosRes.status} ${videosRes.statusText}`)
        }

        // Parse the videos data
        let videosData
        try {
          videosData = await videosRes.json()
          console.log(
            `Home: Fetched ${videosData.length || (videosData.videos && videosData.videos.length) || 0} videos`,
          )
        } catch (e) {
          console.error("Home: Error parsing videos response:", e)
          throw new Error("Invalid videos data received from server")
        }

        setLatestVideos(Array.isArray(videosData) ? videosData : videosData.videos || [])
      } catch (error) {
        console.error("Home: Error fetching videos:", error)
        setLatestVideos([])
      }

      // Fetch latest photos
      try {
        console.log("Home: Fetching photos")
        const photosRes = await fetch("/api/photos?limit=6")

        if (!photosRes.ok) {
          console.error(`Home: Failed to fetch photos: ${photosRes.status} ${photosRes.statusText}`)
          throw new Error(`Failed to fetch photos: ${photosRes.status} ${photosRes.statusText}`)
        }

        // Parse the photos data
        let photosData
        try {
          photosData = await photosRes.json()
          console.log(
            `Home: Fetched ${photosData.length || (photosData.photos && photosData.photos.length) || 0} photos`,
          )
        } catch (e) {
          console.error("Home: Error parsing photos response:", e)
          throw new Error("Invalid photos data received from server")
        }

        setLatestPhotos(Array.isArray(photosData) ? photosData : photosData.photos || [])
      } catch (error) {
        console.error("Home: Error fetching photos:", error)
        setLatestPhotos([])
      }

      // Fetch latest podcasts
      try {
        console.log("Home: Fetching podcasts")
        const podcastsRes = await fetch("/api/podcasts?limit=3")

        if (!podcastsRes.ok) {
          console.error(`Home: Failed to fetch podcasts: ${podcastsRes.status} ${podcastsRes.statusText}`)
          throw new Error(`Failed to fetch podcasts: ${podcastsRes.status} ${podcastsRes.statusText}`)
        }

        // Parse the podcasts data
        let podcastsData
        try {
          podcastsData = await podcastsRes.json()
          console.log(
            `Home: Fetched ${podcastsData.length || (podcastsData.podcasts && podcastsData.podcasts.length) || 0} podcasts`,
          )
        } catch (e) {
          console.error("Home: Error parsing podcasts response:", e)
          throw new Error("Invalid podcasts data received from server")
        }

        // For each podcast, fetch the latest episode
        const fetchedPodcasts = Array.isArray(podcastsData) ? podcastsData : podcastsData.podcasts || []
        const podcastsWithEpisodes = await Promise.all(
          fetchedPodcasts.map(async (podcast: any) => {
            try {
              console.log(`Home: Fetching episodes for podcast ${podcast._id || podcast.id}`)
              const episodesRes = await fetch(`/api/podcasts/${podcast._id || podcast.id}/episodes`)

              if (!episodesRes.ok) {
                console.error(`Home: Failed to fetch episodes: ${episodesRes.status} ${episodesRes.statusText}`)
                return {
                  ...podcast,
                  latestEpisode: null,
                }
              }

              const episodesData = await episodesRes.json()
              return {
                ...podcast,
                latestEpisode: episodesData.episodes?.[0] || null,
              }
            } catch (error) {
              console.error(`Home: Error fetching episodes for podcast ${podcast._id || podcast.id}:`, error)
              return {
                ...podcast,
                latestEpisode: null,
              }
            }
          }),
        )

        setLatestPodcasts(podcastsWithEpisodes)
      } catch (error) {
        console.error("Home: Error fetching podcasts:", error)
        setLatestPodcasts([])
      }

      // Fetch featured sailors (users)
      try {
        console.log("Home: Fetching featured sailors")
        const sailorsRes = await fetch("/api/users?limit=6")

        if (!sailorsRes.ok) {
          console.error(`Home: Failed to fetch sailors: ${sailorsRes.status} ${sailorsRes.statusText}`)
          throw new Error(`Failed to fetch sailors: ${sailorsRes.status} ${sailorsRes.statusText}`)
        }

        // Parse the sailors data
        let sailorsData
        try {
          sailorsData = await sailorsRes.json()
          console.log(
            `Home: Fetched ${sailorsData.length || (sailorsData.users && sailorsData.users.length) || 0} sailors`,
          )
        } catch (e) {
          console.error("Home: Error parsing sailors response:", e)
          throw new Error("Invalid sailors data received from server")
        }

        setFeaturedSailors(Array.isArray(sailorsData) ? sailorsData : sailorsData.users || [])
      } catch (error) {
        console.error("Home: Error fetching featured sailors:", error)
        setFeaturedSailors([])
      }
    } catch (error) {
      console.error("Home: Error fetching latest content:", error)
      setFetchError(error instanceof Error ? error.message : "Failed to load content")
    } finally {
      setIsLoading(false)
    }
  }

  // Create trending content for homepage
  const fetchTrendingContent = () => {
    // Use the latest fetched videos, photos, podcasts
    const videos = latestVideos.slice(0, 3).map((item: any) => ({
      ...item,
      type: "video",
      views: Math.floor(Math.random() * 5000) + 1000,
      id: item._id || item.id,
    }))
    const photos = latestPhotos.slice(0, 2).map((item: any) => ({
      ...item,
      type: "photo",
      views: Math.floor(Math.random() * 3000) + 800,
      id: item._id || item.id,
    }))
    const podcasts = latestPodcasts.slice(0, 1).map((item: any) => ({
      ...item,
      type: "podcast",
      views: Math.floor(Math.random() * 2000) + 500,
      id: item._id || item.id,
    }))
    // Combine and shuffle
    const trending = [...videos, ...photos, ...podcasts]
    const shuffled = trending.sort(() => 0.5 - Math.random()).slice(0, 5)
    setTrendingContent(shuffled)
  }

  const getInitials = (name: string) => {
    if (!name) return "S"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Light Gray Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-700 to-gray-200 overflow-hidden">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 40 10 M 10 0 L 10 40" stroke="black" strokeWidth="0.5" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-gray-400/40 to-gray-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-tr from-gray-400/40 to-gray-500/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              <motion.div variants={fadeIn} className="mb-6">
                <Badge className="px-3 py-1 border-white border text-sm bg-gray-800 text-white  ">
                  <Sparkles className="w-4  h-4 mr-1 text-gray-300" /> Maritime Community
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight"
                variants={fadeIn}
              >
                <span className="relative">
                  <span className="relative text-gray-300 z-10">
                    Discover the Sailor's World
                  </span>
                  {/* <span className="absolute bottom-2 left-0 w-full h-3 bg-gray-400 rounded-full -z-10"></span> */}
                </span>
              </motion.h1>

              <motion.p className="text-lg  md:text-xl mb-8 text-gray-700 max-w-lg" variants={fadeIn}>
                Connect with fellow sailors, share your maritime adventures, and explore a sea of content created by our
                vibrant community.
              </motion.p>

              <motion.div className="flex flex-wrap gap-4" variants={fadeIn}>
                <Link href="/videos">
                  <Button size="lg" className="bg-gray-300 hover:bg-gray-200 text-gray-900 border border-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 dark:border-gray-600 transition-colors">
                    Explore Content <Compass className="ml-2 h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </Button>
                </Link>
                {!isAuthenticated ? (
                  <Link href="/signup">
                    <Button size="lg" variant="outline" className="rounded-xl border-gray-400 bg-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-500 border transition-colors dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-white dark:hover:border-gray-400">
                      Join the Crew <Anchor className="ml-2 h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/community">
                    <Button size="lg" variant="outline" className=" border-gray-400 bg-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-500 border transition-colors dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white dark:hover:border-gray-400">
                      Community <UserCircle2 className="ml-2 h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative aspect-video md:aspect-square max-w-md mx-auto">
                {/* Card Frame */}
                <div className="absolute -top-4 -left-4 -bottom-4 -right-4 bg-gray-200 rounded-2xl transform rotate-3"></div>
                <div className="absolute -top-2 -left-2 -bottom-2 -right-2 bg-gray-300/50 rounded-2xl transform -rotate-2"></div>

                {/* Main image container */}
                <div className="relative z-10 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                  <img
                    src="/d3.jpg"
                    alt="Sailor's Community"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>

                  {/* Floating elements over the image */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-md">
                    <Sailboat className="h-6 w-6 text-gray-700" />
                  </div>

                  {/* Stats overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex justify-between text-white">
                      <div className="text-center">
                        <p className="text-xl font-bold">{latestVideos.length || "10K+"}</p>
                        <p className="text-xs text-gray-200">Videos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">{latestPhotos.length || "25K+"}</p>
                        <p className="text-xs text-gray-200">Photos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">{featuredSailors.length || "5K+"}</p>
                        <p className="text-xs text-gray-200">Sailors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bg-gray-300 bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L48 105C96 90 192 60 288 55C384 50 480 70 576 75C672 80 768 70 864 65C960 60 1056 60 1152 65C1248 70 1344 80 1392 85L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
              fill="white"
              className=" dark:fill-slate-900"
            />
          </svg>
        </div>
      </section>

      {/* Trending Now Section */}
      <section className="py-12 bg-gray-200 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 p-2 rounded-md text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trending Now</h2>
        </div>
        <Link href="/trending">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            See All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
          </div>

          {fetchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center gap-2 mb-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading content</p>
            <p className="text-sm">{fetchError}</p>
          </div>
        </div>
          )}

          {trendingContent.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {isLoading ? "Loading trending content..." : "No trending content available"}
        </div>
          ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {trendingContent.map((item, index) => (
            <Card
          key={item.id || index}
          className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all group"
            >
          <Link href={`/${item.type}s/${item._id || item.id}`}>
            <div
              className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-slate-800 group"
              onMouseEnter={() => setTrendingHover(index)}
              onMouseLeave={() => setTrendingHover(null)}
            >
              {item.type === "video" && trendingHover === index ? (
            <video
              src={item.url}
              poster={
                item.thumbnail_url ||
                `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${item.public_id}.jpg`
              }
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              style={{ zIndex: 10 }}
            />
              ) : (
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
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
              <div className="absolute top-2 left-2">
            <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm">
              {item.type === "video" && <Film className="h-3 w-3 mr-1" />}
              {item.type === "photo" && <ImageIcon className="h-3 w-3 mr-1" />}
              {item.type === "podcast" && <Mic className="h-3 w-3 mr-1" />}#{index + 1} Trending
            </Badge>
              </div>
              {item.type === "video" && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="h-6 w-6 text-white fill-white" />
              </div>
            </div>
              )}
            </div>
          </Link>

          <CardContent className="p-3">
            <Link href={`/${item.type}s/${item._id || item.id}`}>
              <h3 className="font-medium text-sm line-clamp-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {item.title || (item.type === "video" ? item.public_id?.split("/")?.pop() : "Untitled")}
              </h3>
            </Link>

            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <div className="flex items-center">
            <Lightning className="h-3 w-3 mr-1 text-gray-500" />
            {item.views.toLocaleString()} views
              </div>
              <Badge variant="outline" className="font-normal">
            {item.type}
              </Badge>
            </div>
          </CardContent>
            </Card>
          ))}
        </div>
          )}
        </div>
      </section>

      {/* Rest of the sections remain unchanged */}
      {/* Media Categories */}
      <section className="py-12 bg-gray-300 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Explore Maritime Content
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <CategoryCard
              title="Videos"
              icon={<Film className="h-6 w-6" />}
              href="/videos"
              bgClass="from-zinc-900 to-gray-500"
              count={latestVideos.length}
            />
            <CategoryCard
              title="Photos"
              icon={<ImageIcon className="h-6 w-6" />}
              href="/photos"
              bgClass="from-zinc-900 to-gray-500"
              count={latestPhotos.length}
            />
            <CategoryCard
              title="Podcasts"
              icon={<Radio className="h-6 w-6" />}
              href="/podcasts"
              bgClass="from-zinc-900 to-gray-500"
              count={latestPodcasts.length}
            />
            <CategoryCard
              title="News"
              icon={<Newspaper className="h-6 w-6" />}
              href="/news"
              bgClass="from-zinc-900 to-gray-500"
              count={12}
            />
            <CategoryCard
              title="Blogs"
              icon={<BookOpen className="h-6 w-6" />}
              href="/blogs"
              bgClass="from-zinc-900 to-gray-500"
              count={8}
            />
            <CategoryCard
              title="Audio"
              icon={<MicVocal className="h-6 w-6" />}
              href="/audio"
              bgClass="from-zinc-900 to-gray-500"
              count={featuredSailors.length}
            />
          </div>
        </div>
      </section>

      {/* Featured Videos Section */}
      <section className="py-12 bg-gray-300 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Tv className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Videos</h2>
            </div>
            <Link href="/videos">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <VideoGallery limit={6} showSearch={false} showFilters={false} horizontal={true} className="mt-6" />
        </div>
      </section>

      {/* Featured Sailors Section */}
      <section className="py-12 bg-gradient-to-b from-gray-300 to-white dark:from-gray-900 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Sailors</h2>
            </div>
            <Link href="/sailors">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                See All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-y-8 gap-x-6">
            {featuredSailors.length > 0
              ? featuredSailors.map((sailor, index) => (
                  <Link
                    href={`/profile/${sailor._id || sailor.id || sailor.userId}`}
                    key={sailor._id || sailor.id || sailor.userId || index}
                    className="group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute inset-1 rounded-full overflow-hidden bg-white dark:bg-slate-800">
                          <Avatar
                            className="h-full w-full"
                            style={{ boxShadow: "0 0 0 4px #22c55e, 0 0 0 8px #ec4899" }}
                          >
                            <AvatarImage
                              className="object-cover w-full h-full rounded-full"
                              src={
                                sailor.profileImage ||
                                sailor.image ||
                                "/placeholder.svg?height=200&width=200&query=sailor%20profile"
                              }
                              alt={sailor.name || "Sailor"}
                            />
                            <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {getInitials(sailor.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        {sailor.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {sailor.role || sailor.title || "Sailor"}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs font-normal px-2 border-gray-200 dark:border-gray-700"
                      >
                        <Ship className="h-3 w-3 mr-1" />
                        {Math.floor(Math.random() * 100) + 10} Voyages
                      </Badge>
                    </div>
                  </Link>
                ))
              : Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
                    <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Podcasts Section */}
      <section className="py-12 bg-gray-200 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Mic className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Podcasts</h2>
            </div>
            <Link href="/podcasts">
              <Button
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Listen to All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPodcasts.length > 0
              ? latestPodcasts.map((podcast) => (
                  <Link
                    href={`/podcasts/${podcast._id || podcast.id}`}
                    key={podcast._id || podcast.id}
                    className="group overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={podcast.cover_image || "/placeholder.svg?height=720&width=1280&query=podcast%20cover"}
                        alt={podcast.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-gray-700 mb-2 hover:bg-gray-600">Podcast</Badge>
                        <h3 className="text-white font-semibold text-lg line-clamp-1">{podcast.title}</h3>
                        <p className="text-white/70 text-sm line-clamp-1">{podcast.description}</p>
                      </div>
                    </div>

                    {podcast.latestEpisode && (
                      <div className="p-4">
                        <div className="mb-2">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white">Latest Episode:</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                            {podcast.latestEpisode.title}
                          </p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                          <audio
                            src={podcast.latestEpisode.audio_url}
                            controls
                            className="w-full h-10"
                            controlsList="nodownload"
                          ></audio>
                        </div>
                      </div>
                    )}
                  </Link>
                ))
              : Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800"
                  >
                    <div className="aspect-video bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-700 to-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Set Sail?</h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Join our growing community of sailors. Share your stories, discover new content, and connect with fellow
            maritime enthusiasts.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-gray-800 hover:bg-gray-300">
                    Signup <Users className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button size="lg" variant="outline" className="border-white text-gray-500 hover:bg-white/10">
                    Sign In <Anchor className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/photos">
                  <Button size="lg" className="bg-white text-gray-800 hover:bg-gray-300">
                    Share Moments of Sea <Upload className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/profile/me">
                  <Button size="lg" variant="outline" className="border-white text-gray-500 hover:bg-gray-500 hover:text-white">
                    <Link
                      href={`/profile/${session?.user?.id || 'me'}`}
                      className="flex items-center py-2 text-sm rounded-lg text-gray-800  dark:text-gray-300 "
                      
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// Helper Component for Category Cards
function CategoryCard({
  title,
  icon,
  href,
  bgClass,
  count = 0,
}: {
  title: string
  icon: React.ReactNode
  href: string
  bgClass: string
  count: number
}) {
  return (
    <Link href={href}>
      <Card className="overflow-hidden h-full border-none shadow-md hover:shadow-lg transition-all group">
        <div className={`h-24 bg-gradient-to-r ${bgClass} flex items-center justify-center text-white`}>
          <div className="transform group-hover:scale-110 transition-transform">{icon}</div>
        </div>
        <CardContent className="p-3 text-center">
          <h3 className="font-medium">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{count} items</p>
        </CardContent>
      </Card>
    </Link>
  )
}
