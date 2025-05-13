"use client"

import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Music,
  Download,
  Heart,
  MessageSquare,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import PlaylistManager from "./playlist-manager"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"

interface Audio {
  id: string
  public_id: string
  url: string
  resource_type: string
  format: string
  duration: number
  title: string
  thumbnail_url?: string
  created_at: string
}

interface Playlist {
  id: string
  name: string
  description: string
  audio_ids: string[]
  created_at: string
  updated_at: string
}

interface Comment {
  id: string
  text: string
  author: string
  authorImage?: string
  date: string
  likes: number
}

export interface AudioGalleryRef {
  fetchAudios: () => Promise<void>
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const AudioGallery = forwardRef<AudioGalleryRef>((props, ref) => {
  const { data: session } = useSession()
  const [audios, setAudios] = useState<Audio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Audio player state
  const [currentAudio, setCurrentAudio] = useState<Audio | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Playlist state
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [playlistAudios, setPlaylistAudios] = useState<Audio[]>([])
  const [activeTab, setActiveTab] = useState("library")

  // Social features
  const [likedAudios, setLikedAudios] = useState<Record<string, boolean>>({})
  const [expandedAudio, setExpandedAudio] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")

  // Mock comments for demonstration
  const [audioComments, setAudioComments] = useState<Record<string, Comment[]>>({})

  const fetchAudios = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/audio")

      if (!response.ok) {
        throw new Error(`Failed to fetch audio files: ${response.statusText}`)
      }

      // Try to parse the response as JSON
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError)
        throw new Error("Invalid response format from server")
      }

      // Validate that data is an array
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", typeof data)
        setAudios([])
      } else {
        setAudios(data)

        // Initialize mock comments for each audio
        const initialComments: Record<string, Comment[]> = {}
        data.forEach((audio) => {
          initialComments[audio.id] = [
            {
              id: `comment-${Math.random().toString(36).substr(2, 9)}`,
              text: "This sea shanty brings back memories of my voyages!",
              author: "Captain Morgan",
              authorImage: "/diverse-avatars.png",
              date: "2 days ago",
              likes: 4,
            },
          ]
        })
        setAudioComments(initialComments)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching audio files:", err)
      setError(err instanceof Error ? err.message : "Failed to load audio files")
    } finally {
      setLoading(false)
    }
  }

  // Expose the fetchAudios method via ref
  useImperativeHandle(ref, () => ({
    fetchAudios,
  }))

  useEffect(() => {
    fetchAudios()
  }, [])

  // Update playlist audios when current playlist changes
  useEffect(() => {
    if (currentPlaylist) {
      const filteredAudios = audios.filter((audio) => currentPlaylist.audio_ids.includes(audio.id))
      setPlaylistAudios(filteredAudios)
    }
  }, [currentPlaylist, audios])

  // Audio player controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime
      setCurrentTime(time)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const time = value[0]
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const playAudio = (audio: Audio) => {
    setCurrentAudio(audio)
    setIsPlaying(true)
    // The audio will start playing when the src changes due to the autoPlay attribute
  }

  const playNext = () => {
    if (!currentAudio) return

    const currentList = activeTab === "playlist" && currentPlaylist ? playlistAudios : audios
    if (currentList.length === 0) return

    const currentIndex = currentList.findIndex((audio) => audio.id === currentAudio.id)
    if (currentIndex === -1) return

    const nextIndex = (currentIndex + 1) % currentList.length
    playAudio(currentList[nextIndex])
  }

  const playPrevious = () => {
    if (!currentAudio) return

    const currentList = activeTab === "playlist" && currentPlaylist ? playlistAudios : audios
    if (currentList.length === 0) return

    const currentIndex = currentList.findIndex((audio) => audio.id === currentAudio.id)
    if (currentIndex === -1) return

    const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length
    playAudio(currentList[prevIndex])
  }

  const downloadAudio = (audio: Audio) => {
    // Create a temporary anchor element
    const a = document.createElement("a")
    a.href = audio.url
    a.download = `${audio.title}.${audio.format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handlePlaylistSelect = (playlist: Playlist) => {
    setCurrentPlaylist(playlist)
    setActiveTab("playlist")
  }

  const toggleLike = (audioId: string) => {
    setLikedAudios((prev) => ({
      ...prev,
      [audioId]: !prev[audioId],
    }))
  }

  const toggleExpand = (audioId: string) => {
    setExpandedAudio((prev) => (prev === audioId ? null : audioId))
  }

  const handleComment = (audioId: string) => {
    if (!commentText.trim()) return

    const newComment: Comment = {
      id: `comment-${Math.random().toString(36).substr(2, 9)}`,
      text: commentText,
      author: session?.user?.name || "Anonymous Sailor",
      authorImage: session?.user?.image || "/diverse-avatars.png",
      date: "Just now",
      likes: 0,
    }

    setAudioComments((prev) => ({
      ...prev,
      [audioId]: [...(prev[audioId] || []), newComment],
    }))

    setCommentText("")
  }

  const likeComment = (audioId: string, commentId: string) => {
    setAudioComments((prev) => {
      const updatedComments = { ...prev }
      const commentIndex = updatedComments[audioId].findIndex((c) => c.id === commentId)

      if (commentIndex !== -1) {
        updatedComments[audioId][commentIndex].likes += 1
      }

      return updatedComments
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audio Gallery</CardTitle>
          <CardDescription>Loading your audio files...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="w-full border-cyan-200 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b border-cyan-100">
          <div>
            <CardTitle className="text-cyan-900">Sea Shanties</CardTitle>
            <CardDescription>
              {currentAudio ? `Now playing: ${currentAudio.title}` : "Select a sea shanty to play"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAudios} disabled={loading} className="border-cyan-200">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Tunes
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error loading audio files</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Audio Player */}
          {currentAudio && (
            <div className="mb-6 p-4 bg-gradient-to-b from-white to-cyan-50 rounded-lg shadow-sm">
              <audio
                ref={audioRef}
                src={currentAudio.url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={playNext}
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
              />

              <div className="flex items-center gap-4 mb-4">
                {currentAudio.thumbnail_url ? (
                  <img
                    src={currentAudio.thumbnail_url || "/placeholder.svg"}
                    alt={currentAudio.title}
                    className="h-16 w-16 object-cover rounded-md shadow-md"
                  />
                ) : (
                  <div className="h-16 w-16 bg-cyan-100 rounded-md flex items-center justify-center shadow-md">
                    <Music className="h-8 w-8 text-cyan-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-cyan-900">{currentAudio.title}</div>
                  <div className="text-xs text-cyan-700">
                    {formatTime(currentTime)} / {formatTime(currentAudio.duration || 0)}
                  </div>
                  <Slider
                    value={[currentTime]}
                    min={0}
                    max={currentAudio.duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="mt-2"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-cyan-700"
                  onClick={() => downloadAudio(currentAudio)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={playPrevious}
                    className="border-cyan-200 text-cyan-700"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={togglePlay}
                    className="bg-cyan-600 hover:bg-cyan-700 h-10 w-10 rounded-full"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={playNext} className="border-cyan-200 text-cyan-700">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-cyan-700" />
                  <Slider
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(currentAudio.id)}
                    className={likedAudios[currentAudio.id] ? "text-red-500" : "text-gray-500"}
                  >
                    <Heart className="h-4 w-4 mr-2" fill={likedAudios[currentAudio.id] ? "currentColor" : "none"} />
                    {likedAudios[currentAudio.id] ? "Liked" : "Like"}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2 bg-cyan-50">
              <TabsTrigger value="library" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                Library
              </TabsTrigger>
              <TabsTrigger value="playlist" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                Playlists
              </TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="space-y-4 mt-4">
              {/* Audio List */}
              {audios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Record your first sea shanty to hear it here
                </div>
              ) : (
                <div className="space-y-2">
                  {audios.map((audio) => (
                    <div
                      key={audio.id}
                      className={`p-4 rounded-md flex flex-col gap-3 cursor-pointer hover:bg-cyan-50 transition-colors ${
                        currentAudio?.id === audio.id
                          ? "bg-cyan-50 border border-cyan-200"
                          : "bg-white border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {audio.thumbnail_url ? (
                          <img
                            src={audio.thumbnail_url || "/placeholder.svg"}
                            alt={audio.title}
                            className="h-12 w-12 object-cover rounded-md flex-shrink-0 shadow-sm"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-cyan-100 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Music className="h-6 w-6 text-cyan-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-cyan-900">{audio.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-cyan-200 text-cyan-700">
                              {formatTime(audio.duration || 0)}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-cyan-200 text-cyan-700">
                              {audio.format.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(audio.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              downloadAudio(audio)
                            }}
                            className="text-cyan-700"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              playAudio(audio)
                            }}
                            className="text-cyan-700"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-cyan-100">
                        <div className="flex space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(audio.id)}
                            className={likedAudios[audio.id] ? "text-red-500" : "text-gray-500"}
                          >
                            <Heart className="h-4 w-4 mr-2" fill={likedAudios[audio.id] ? "currentColor" : "none"} />
                            {likedAudios[audio.id] ? "Liked" : "Like"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(audio.id)}
                            className="text-gray-500"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Comments ({audioComments[audio.id]?.length || 0})
                          </Button>

                          <Button variant="ghost" size="sm" className="text-gray-500">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>

                        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={() => playAudio(audio)}>
                          <Play className="h-4 w-4 mr-2" /> Play
                        </Button>
                      </div>

                      {expandedAudio === audio.id && (
                        <div className="mt-2 space-y-4 pt-2 border-t border-cyan-100">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={session?.user?.image || "/placeholder.svg?height=40&width=40&query=avatar"}
                              />
                              <AvatarFallback>{session?.user?.name?.[0] || "S"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Textarea
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="min-h-[80px] border-cyan-200 focus-visible:ring-cyan-500"
                              />
                              <Button
                                onClick={() => handleComment(audio.id)}
                                className="mt-2 bg-cyan-600 hover:bg-cyan-700"
                                disabled={!commentText.trim()}
                              >
                                Post Comment
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {audioComments[audio.id]?.map((comment) => (
                              <div key={comment.id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.authorImage || "/placeholder.svg"} />
                                  <AvatarFallback>{comment.author[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{comment.author}</span>
                                    <span className="text-xs text-muted-foreground">{comment.date}</span>
                                  </div>
                                  <p className="mt-1">{comment.text}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-muted-foreground mt-1"
                                    onClick={() => likeComment(audio.id, comment.id)}
                                  >
                                    <Heart className="h-3 w-3 mr-1" /> {comment.likes}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="playlist" className="space-y-4 mt-4">
              {currentPlaylist ? (
                <>
                  <div className="flex items-center justify-between bg-gradient-to-r from-cyan-50 to-white p-4 rounded-lg shadow-sm">
                    <div>
                      <h3 className="text-lg font-medium text-cyan-900">{currentPlaylist.name}</h3>
                      <p className="text-sm text-cyan-700">{currentPlaylist.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPlaylist(null)}
                      className="border-cyan-200"
                    >
                      Back to Playlists
                    </Button>
                  </div>
                  {playlistAudios.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      This playlist is empty. Add some audio files!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {playlistAudios.map((audio) => (
                        <div
                          key={audio.id}
                          className={`p-4 rounded-md flex items-center gap-3 cursor-pointer hover:bg-cyan-50 transition-colors ${
                            currentAudio?.id === audio.id
                              ? "bg-cyan-50 border border-cyan-200"
                              : "bg-white border border-transparent"
                          }`}
                          onClick={() => playAudio(audio)}
                        >
                          {audio.thumbnail_url ? (
                            <img
                              src={audio.thumbnail_url || "/placeholder.svg"}
                              alt={audio.title}
                              className="h-12 w-12 object-cover rounded-md flex-shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-cyan-100 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Music className="h-6 w-6 text-cyan-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-cyan-900">{audio.title}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs border-cyan-200 text-cyan-700">
                                {formatTime(audio.duration || 0)}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-cyan-200 text-cyan-700">
                                {audio.format.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(audio.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadAudio(audio)
                              }}
                              className="text-cyan-700"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                playAudio(audio)
                              }}
                              className="text-cyan-700"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <PlaylistManager
                  audios={audios}
                  onPlaylistSelect={handlePlaylistSelect}
                  currentPlaylistId={currentPlaylist?.id}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
})

AudioGallery.displayName = "AudioGallery"

export default AudioGallery
