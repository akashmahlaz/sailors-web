"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, Mic, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PodcastEpisodeUploader from "@/components/podcast-episode-uploader"
import PodcastPlayer from "@/components/podcast-player"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Podcast {
  id: string
  title: string
  description: string
  host: string
  cover_image_url?: string
  thumbnail_url?: string
  photo_url?: string
  audio_url?: string
  audio_public_id?: string
  video_url?: string
  video_public_id?: string
  categories: string[]
  episode_count: number
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
  created_at: string
  updated_at: string
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
  const [activeTab, setActiveTab] = useState<string>("audio")
  const [debugInfo, setDebugInfo] = useState<string>("")

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
  }

  const handlePrevious = () => {
    if (!selectedEpisode || episodes.length <= 1) return

    const currentIndex = episodes.findIndex((ep) => ep.id === selectedEpisode.id)
    if (currentIndex === -1) return

    const prevIndex = (currentIndex - 1 + episodes.length) % episodes.length
    setSelectedEpisode(episodes[prevIndex])
  }

  const handleNext = () => {
    if (!selectedEpisode || episodes.length <= 1) return

    const currentIndex = episodes.findIndex((ep) => ep.id === selectedEpisode.id)
    if (currentIndex === -1) return

    const nextIndex = (currentIndex + 1) % episodes.length
    setSelectedEpisode(episodes[nextIndex])
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

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                  <TabsTrigger value="player">Player</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    {podcast.cover_image_url ? (
                      <img
                        src={podcast.cover_image_url || "/placeholder.svg"}
                        alt={podcast.title}
                        className="w-full aspect-square object-cover rounded-md mb-4"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-primary/10 rounded-md flex items-center justify-center mb-4">
                        <Mic className="h-24 w-24 text-primary" />
                      </div>
                    )}
                    <h2 className="text-2xl font-bold mb-2">{podcast.title}</h2>
                    <p className="text-muted-foreground mb-2">Hosted by {podcast.host}</p>
                    <div className="flex flex-wrap justify-center gap-1 mb-4">
                      {podcast.categories.map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm">{podcast.description}</p>
                  </div>
                </TabsContent>
                <TabsContent value="media" className="space-y-4">
                  <div className="space-y-4">
                    {podcast.thumbnail_url && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Thumbnail</h3>
                        <img
                          src={podcast.thumbnail_url || "/placeholder.svg"}
                          alt="Thumbnail"
                          className="w-full h-48 object-cover rounded-md"
                        />
                      </div>
                    )}
                    {podcast.photo_url && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Photo</h3>
                        <img
                          src={podcast.photo_url || "/placeholder.svg"}
                          alt="Photo"
                          className="w-full h-48 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="player" className="space-y-4">
                  <div className="space-y-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="audio">Audio</TabsTrigger>
                        <TabsTrigger value="video" disabled={!podcast.video_url}>
                          Video
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="audio" className="space-y-4">
                        {podcast.audio_url ? (
                          <div className="space-y-2">
                            <h3 className="font-medium">Podcast Audio</h3>
                            <audio src={podcast.audio_url} controls className="w-full" />
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground">No audio available</p>
                        )}
                      </TabsContent>
                      <TabsContent value="video" className="space-y-4">
                        {podcast.video_url ? (
                          <div className="space-y-2">
                            <h3 className="font-medium">Podcast Video</h3>
                            <video src={podcast.video_url} controls className="w-full rounded-md" />
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground">No video available</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-4">
            <Button onClick={() => setShowUploader(!showUploader)} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> {showUploader ? "Hide Uploader" : "Add New Episode"}
            </Button>
          </div>

          {showUploader && (
            <div className="mt-4">
              <PodcastEpisodeUploader podcastId={podcast.id} onUploadSuccess={fetchPodcastAndEpisodes} />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          {selectedEpisode ? (
            <div className="space-y-6">
              <PodcastPlayer
                episode={selectedEpisode}
                onNext={episodes.length > 1 ? handleNext : undefined}
                onPrevious={episodes.length > 1 ? handlePrevious : undefined}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Episodes</CardTitle>
                  <CardDescription>{episodes.length} episodes available</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {episodes.map((episode) => (
                      <div
                        key={episode.id}
                        className={`p-3 rounded-md flex items-center gap-3 cursor-pointer hover:bg-muted transition-colors ${
                          selectedEpisode.id === episode.id ? "bg-muted" : ""
                        }`}
                        onClick={() => handleEpisodeSelect(episode)}
                      >
                        <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                          <span className="font-medium">
                            S{episode.season}E{episode.episode_number}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{episode.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {Math.floor(episode.duration / 60)} min •{" "}
                            {new Date(episode.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No episodes yet. Add your first episode!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
