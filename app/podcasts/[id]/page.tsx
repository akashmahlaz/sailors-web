"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, Mic, Plus, Play, Headphones, Calendar, Clock, Share2, Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PodcastEpisodeUploader from "@/components/podcast-episode-uploader"
import PodcastPlayer from "@/components/podcast-player"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"

interface Podcast {
  id: string
  title: string
  description: string
  host: string
  host_id?: string
  host_image?: string
  cover_image_url?: string
  thumbnail_url?: string
  photo_url?: string
  audio_url?: string
  audio_public_id?: string
  video_url?: string
  video_public_id?: string
  categories: string[]
  episode_count: number
  views: number
  likes: number
  created_at: string
  updated_at: string
}

interface Episode {
  id: string
  podcast_id: string
  title: string
  description: string
  audio_url: string
  public_id: string
  duration: number
  episode_number: number
  season: number
  thumbnail_url?: string
  video_url?: string
  created_at: string
  updated_at: string
  views: number
  likes: number
}

export default function PodcastDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [showUploader, setShowUploader] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("episodes")
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [likedPodcast, setLikedPodcast] = useState(false)

  const fetchPodcastAndEpisodes = async () => {
    try {
      setLoading(true)
      setDebugInfo("Fetching podcast data...")

      // Fetch podcast details
      const podcastUrl = `/api/podcasts/${params.id}`
      setDebugInfo((prev) => `${prev}\nFetching from: ${podcastUrl}`)

      const podcastResponse = await fetch(podcastUrl)

      if (!podcastResponse.ok) {
        const errorText = await podcastResponse.text()
        setDebugInfo((prev) => `${prev}\nPodcast fetch error: ${podcastResponse.status} - ${errorText}`)
        throw new Error(`Failed to fetch podcast: ${podcastResponse.statusText}`)
      }

      const podcastData = await podcastResponse.json()
      setDebugInfo((prev) => `${prev}\nPodcast data received: ${JSON.stringify(podcastData).substring(0, 100)}...`)
      setPodcast(podcastData)

      // Record view
      await fetch(`/api/podcasts/${params.id}/view`, {
        method: "POST",
      }).catch((err) => console.error("Error recording view:", err))

      // Fetch episodes
      const episodesUrl = `/api/podcasts/${params.id}/episodes`
      setDebugInfo((prev) => `${prev}\nFetching episodes from: ${episodesUrl}`)

      const episodesResponse = await fetch(episodesUrl)

      if (!episodesResponse.ok) {
        const errorText = await episodesResponse.text()
        setDebugInfo((prev) => `${prev}\nEpisodes fetch error: ${episodesResponse.status} - ${errorText}`)
        throw new Error(`Failed to fetch episodes: ${episodesResponse.statusText}`)
      }

      const episodesData = await episodesResponse.json()
      setDebugInfo((prev) => `${prev}\nEpisodes data received: ${episodesData.length} episodes`)
      setEpisodes(episodesData)

      // Set the first episode as selected if available
      if (episodesData.length > 0) {
        setSelectedEpisode(episodesData[0])
        setDebugInfo((prev) => `${prev}\nSelected first episode: ${episodesData[0].title}`)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching podcast data:", err)
      setDebugInfo((prev) => `${prev}\nError: ${err instanceof Error ? err.message : "Unknown error"}`)
      setError(err instanceof Error ? err.message : "Failed to load podcast")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPodcastAndEpisodes()
  }, [params.id])

  const handleEpisodeSelect = (episode: Episode) => {
    setSelectedEpisode(episode)

    // Record episode view
    fetch(`/api/podcasts/${params.id}/episodes/${episode.id}/view`, {
      method: "POST",
    }).catch((err) => console.error("Error recording episode view:", err))
  }

  const handlePrevious = () => {
    if (!selectedEpisode || episodes.length <= 1) return

    const currentIndex = episodes.findIndex((ep) => ep.id === selectedEpisode.id)
    if (currentIndex === -1) return

    const prevIndex = (currentIndex - 1 + episodes.length) % episodes.length
    handleEpisodeSelect(episodes[prevIndex])
  }

  const handleNext = () => {
    if (!selectedEpisode || episodes.length <= 1) return

    const currentIndex = episodes.findIndex((ep) => ep.id === selectedEpisode.id)
    if (currentIndex === -1) return

    const nextIndex = (currentIndex + 1) % episodes.length
    handleEpisodeSelect(episodes[nextIndex])
  }

  const toggleLike = async () => {
    if (!podcast) return

    try {
      const response = await fetch(`/api/podcasts/${podcast.id}/like`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to like podcast")

      const { liked } = await response.json()
      setLikedPodcast(liked)

      // Update podcast likes count
      setPodcast((prev) => {
        if (!prev) return null
        return {
          ...prev,
          likes: liked ? prev.likes + 1 : Math.max(0, prev.likes - 1),
        }
      })
    } catch (error) {
      console.error("Error liking podcast:", error)
      toast({
        title: "Error",
        description: "Failed to like podcast",
        variant: "destructive",
      })
    }
  }

  const sharePodcast = () => {
    if (!podcast) return

    if (navigator.share) {
      navigator
        .share({
          title: podcast.title,
          text: podcast.description || "Check out this podcast!",
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Podcast link copied to clipboard",
      })
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/podcasts")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Podcasts
        </Button>
        <div className="grid gap-8">
          <Skeleton className="h-64 w-full rounded-md" />
          <Skeleton className="h-96 w-full rounded-md" />
        </div>
      </main>
    )
  }

  if (error || !podcast) {
    return (
      <main className="container mx-auto py-8 px-4">
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/podcasts")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Podcasts
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error || "Podcast not found"}</span>
            </div>
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">Debug Information:</h3>
              <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/podcasts")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Podcasts
      </Button>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Podcast Header */}
        <div className="md:col-span-12">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="relative">
              {/* Cover Image or Gradient Background */}
              <div className="w-full h-48 md:h-64 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
                {podcast.cover_image_url && (
                  <img
                    src={podcast.cover_image_url || "/placeholder.svg"}
                    alt={podcast.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>

              {/* Podcast Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-start gap-6">
                  {/* Thumbnail */}
                  <div className="hidden md:block relative w-32 h-32 rounded-lg overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                    {podcast.thumbnail_url ? (
                      <img
                        src={podcast.thumbnail_url || "/placeholder.svg"}
                        alt={podcast.title}
                        className="w-full h-full object-cover"
                      />
                    ) : podcast.photo_url ? (
                      <img
                        src={podcast.photo_url || "/placeholder.svg"}
                        alt={podcast.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Mic className="h-12 w-12 text-white" />
                      </div>
                    )}

                    {/* Video indicator */}
                    {podcast.video_url && (
                      <div className="absolute bottom-1 right-1 bg-red-600 text-white p-1 rounded-full">
                        <Play className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Title and Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {podcast.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="bg-white/20 text-white border-none">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">{podcast.title}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={podcast.host_image || "/placeholder.svg"} />
                        <AvatarFallback>{podcast.host[0]}</AvatarFallback>
                      </Avatar>
                      <span>Hosted by {podcast.host}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Thumbnail */}
            <div className="md:hidden flex justify-center -mt-16 mb-4 px-4">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                {podcast.thumbnail_url ? (
                  <img
                    src={podcast.thumbnail_url || "/placeholder.svg"}
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                  />
                ) : podcast.photo_url ? (
                  <img
                    src={podcast.photo_url || "/placeholder.svg"}
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <Mic className="h-12 w-12 text-white" />
                  </div>
                )}

                {/* Video indicator */}
                {podcast.video_url && (
                  <div className="absolute bottom-1 right-1 bg-red-600 text-white p-1 rounded-full">
                    <Play className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Headphones className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{podcast.episode_count} episodes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(podcast.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleLike}>
                  <Heart className="h-4 w-4 mr-1" fill={likedPodcast ? "currentColor" : "none"} />
                  {podcast.likes}
                </Button>
                <Button variant="ghost" size="sm" onClick={sharePodcast}>
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Media Section - Show video first if available */}
        {podcast.video_url && (
          <div className="md:col-span-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2 text-red-600" />
                  Podcast Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-md overflow-hidden bg-black">
                  <video
                    src={podcast.video_url}
                    controls
                    poster={podcast.thumbnail_url || podcast.photo_url}
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audio Section - Show after video */}
        {podcast.audio_url && (
          <div className="md:col-span-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Headphones className="h-5 w-5 mr-2 text-blue-600" />
                  Podcast Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <audio src={podcast.audio_url} controls className="w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Description */}
        <div className="md:col-span-12">
          <Card>
            <CardHeader>
              <CardTitle>About this Podcast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{podcast.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Episodes and Info Tabs */}
        <div className="md:col-span-12">
          <Tabs defaultValue="episodes" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="episodes">Episodes</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="episodes" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowUploader(!showUploader)} variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> {showUploader ? "Hide Uploader" : "Add New Episode"}
                </Button>
              </div>

              {showUploader && (
                <Card>
                  <CardContent className="pt-6">
                    <PodcastEpisodeUploader podcastId={podcast.id} onUploadSuccess={fetchPodcastAndEpisodes} />
                  </CardContent>
                </Card>
              )}

              {selectedEpisode && (
                <Card className="border-blue-100 shadow-md">
                  <CardContent className="p-6">
                    <PodcastPlayer
                      episode={selectedEpisode}
                      onNext={episodes.length > 1 ? handleNext : undefined}
                      onPrevious={episodes.length > 1 ? handlePrevious : undefined}
                    />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>All Episodes</CardTitle>
                  <CardDescription>{episodes.length} episodes available</CardDescription>
                </CardHeader>
                <CardContent>
                  {episodes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No episodes yet. Add your first episode!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {episodes.map((episode) => (
                        <div
                          key={episode.id}
                          className={`p-3 rounded-md flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedEpisode?.id === episode.id
                              ? "bg-blue-50 border border-blue-100"
                              : "border border-gray-100"
                          }`}
                          onClick={() => handleEpisodeSelect(episode)}
                        >
                          {/* Episode Thumbnail or Number */}
                          <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                            {episode.thumbnail_url ? (
                              <img
                                src={episode.thumbnail_url || "/placeholder.svg"}
                                alt={episode.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <span className="font-medium text-gray-800">
                                  S{episode.season}E{episode.episode_number}
                                </span>
                              </div>
                            )}

                            {/* Video indicator */}
                            {episode.video_url && (
                              <div className="absolute bottom-1 right-1 bg-red-600 text-white p-1 rounded-full">
                                <Play className="h-3 w-3" />
                              </div>
                            )}
                          </div>

                          {/* Episode Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{episode.title}</p>
                            <p className="text-xs text-gray-500 truncate">{episode.description}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {Math.floor(episode.duration / 60)} min
                              </span>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDistanceToNow(new Date(episode.created_at), { addSuffix: true })}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Eye className="h-3 w-3 mr-1" />
                                {episode.views || 0}
                              </span>
                            </div>
                          </div>

                          {/* Play Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Podcast Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">Host</h3>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={podcast.host_image || "/placeholder.svg"} />
                          <AvatarFallback>{podcast.host[0]}</AvatarFallback>
                        </Avatar>
                        <span>{podcast.host}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">Categories</h3>
                      <div className="flex flex-wrap gap-1">
                        {podcast.categories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">Created</h3>
                      <p>{new Date(podcast.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                      <p>{new Date(podcast.updated_at).toLocaleDateString()}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">Episodes</h3>
                      <p>{podcast.episode_count} episodes</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">Views</h3>
                      <p>{podcast.views || 0} views</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Media Gallery */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-500">Media Gallery</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {podcast.cover_image_url && (
                        <div className="space-y-1">
                          <div className="aspect-square rounded-md overflow-hidden border border-gray-200">
                            <img
                              src={podcast.cover_image_url || "/placeholder.svg"}
                              alt="Cover"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Cover Image</p>
                        </div>
                      )}

                      {podcast.thumbnail_url && (
                        <div className="space-y-1">
                          <div className="aspect-square rounded-md overflow-hidden border border-gray-200">
                            <img
                              src={podcast.thumbnail_url || "/placeholder.svg"}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Thumbnail</p>
                        </div>
                      )}

                      {podcast.photo_url && (
                        <div className="space-y-1">
                          <div className="aspect-square rounded-md overflow-hidden border border-gray-200">
                            <img
                              src={podcast.photo_url || "/placeholder.svg"}
                              alt="Photo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Photo</p>
                        </div>
                      )}

                      {podcast.video_url && (
                        <div className="space-y-1">
                          <div className="aspect-square rounded-md overflow-hidden border border-gray-200 relative">
                            <img
                              src={podcast.thumbnail_url || podcast.photo_url || "/placeholder.svg"}
                              alt="Video"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="h-10 w-10 text-white" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Video</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
