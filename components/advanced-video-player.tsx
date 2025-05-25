"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  RotateCcw,
  RotateCw,
  Clock,
  Captions,
  PictureInPicture,
  Share2,
  Heart,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"

interface Video {
  id: string
  url: string
  title: string
  public_id: string
  thumbnail_url?: string | null
}

interface AdvancedVideoPlayerProps {
  video: Video
  onNext?: () => void
  onPrevious?: () => void
  relatedVideos?: Video[]
}

export default function AdvancedVideoPlayer({
  video,
  onNext,
  onPrevious,
  relatedVideos = [],
}: AdvancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null)
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Like state
  const { data: session } = useSession()
  const [likeState, setLikeState] = useState<{ liked: boolean; likesCount: number }>({ liked: false, likesCount: 0 })

  // Fetch like state on mount
  useEffect(() => {
    async function fetchLikeState() {
      if (!video.id || !session?.user?.id) return
      try {
        const res = await fetch(`/api/videos/${video.id}`)
        if (res.ok) {
          const data = await res.json()
          setLikeState({
            liked: Boolean(session?.user && data.likes?.some((l: any) => l.userId === session.user?.id)),
            likesCount: data.likes?.length || 0,
          })
        }
      } catch {}
    }
    fetchLikeState()
  }, [video.id, session?.user?.id])

  const handleLike = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like videos",
        variant: "destructive",
      })
      return
    }
    try {
      const res = await fetch(`/api/videos/${video.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setLikeState({ liked: data.liked, likesCount: data.likesCount })
      }
    } catch(err) {
       console.error("Error liking video:", err)
       toast({
         title: "Error",
         description: "Failed to update like",
         variant: "destructive",
       })
    }
  }

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime)
    }

    const handleDurationChange = () => {
      setDuration(videoElement.duration)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleVolumeChange = () => {
      setVolume(videoElement.volume)
      setIsMuted(videoElement.muted)
    }

    const handleLoadedData = () => {
      setIsLoaded(true)
    }

    const handleError = (e: any) => {
      console.error("Video error:", e)
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handlePlaying = () => {
      setIsBuffering(false)
    }

    const handleProgress = () => {
      if (videoElement.buffered.length > 0) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1)
        const duration = videoElement.duration
        if (bufferedEnd < duration) {
          setIsBuffering(true)
        } else {
          setIsBuffering(false)
        }
      }
    }

    videoElement.addEventListener("timeupdate", handleTimeUpdate)
    videoElement.addEventListener("durationchange", handleDurationChange)
    videoElement.addEventListener("play", handlePlay)
    videoElement.addEventListener("pause", handlePause)
    videoElement.addEventListener("volumechange", handleVolumeChange)
    videoElement.addEventListener("loadeddata", handleLoadedData)
    videoElement.addEventListener("error", handleError)
    videoElement.addEventListener("waiting", handleWaiting)
    videoElement.addEventListener("playing", handlePlaying)
    videoElement.addEventListener("progress", handleProgress)

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
      videoElement.removeEventListener("durationchange", handleDurationChange)
      videoElement.removeEventListener("play", handlePlay)
      videoElement.removeEventListener("pause", handlePause)
      videoElement.removeEventListener("volumechange", handleVolumeChange)
      videoElement.removeEventListener("loadeddata", handleLoadedData)
      videoElement.removeEventListener("error", handleError)
      videoElement.removeEventListener("waiting", handleWaiting)
      videoElement.removeEventListener("playing", handlePlaying)
      videoElement.removeEventListener("progress", handleProgress)
    }
  }, [video])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Reset video state when video changes
  useEffect(() => {
    setIsLoaded(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setIsBuffering(false)

    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [video.url])

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
  }

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    const newVolume = value[0]
    videoRef.current.volume = newVolume
    if (newVolume === 0) {
      videoRef.current.muted = true
    } else if (isMuted) {
      videoRef.current.muted = false
    }
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = value[0]
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  // Generate video thumbnail
  const generateVideoThumbnail = () => {
    if (!videoRef.current || isGeneratingThumbnail) return

    setIsGeneratingThumbnail(true)
    const video = videoRef.current
    const timestamps = [1, 2, 3] // Try at 1s, 2s, and 3s
    let currentTimestampIndex = 0

    const tryNextTimestamp = () => {
      if (currentTimestampIndex < timestamps.length) {
        video.currentTime = timestamps[currentTimestampIndex]
        currentTimestampIndex++
      }
    }

    const handleSeeked = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
        setVideoThumbnail(thumbnailUrl)
        tryNextTimestamp()
      }
    }

    video.addEventListener('seeked', handleSeeked)
    tryNextTimestamp()

    // Cleanup
    return () => {
      video.removeEventListener('seeked', handleSeeked)
      setIsGeneratingThumbnail(false)
    }
  }

  // Generate thumbnail when video is loaded
  useEffect(() => {
    if (videoRef.current && !video.thumbnail_url) {
      generateVideoThumbnail()
    }
  }, [video.url])

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black aspect-video select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-contain"
        poster={video.thumbnail_url || videoThumbnail || `/placeholder.svg`}
        onClick={togglePlay}
        controls={false}
        preload="metadata"
        crossOrigin="anonymous"
        playsInline
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration)
            setIsLoaded(true)
          }
        }}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
      />

      {/* Loading and buffering states */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {/* Video Controls */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between pointer-events-none z-30 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Center Play/Pause Button */}
        <div className="flex-1 flex items-center justify-center pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/60 hover:bg-black/80 !h-16 !w-16"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
        </div>

        {/* Bottom Controls */}
        <div className="w-full flex flex-col gap-1 pb-2 pointer-events-auto">
          {/* Progress Bar */}
          <div className="relative w-full h-2 flex items-center">
            <div className="absolute left-0 top-0 h-1 w-full bg-white/20 rounded-full" />
            <div
              className="absolute left-0 top-0 h-1 bg-red-600 rounded-full"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full h-2 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity absolute left-0 top-0 z-10"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between px-2 gap-2">
            {/* Left: Play, Volume, Time */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-white" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>
              <span className="text-xs text-white tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right: Fullscreen and Like */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`text-white ${likeState.liked ? "text-red-500" : ""}`}
                onClick={handleLike}
                aria-label={likeState.liked ? "Unlike" : "Like"}
                disabled={!session?.user?.id}
              >
                <Heart className={likeState.liked ? "fill-current" : ""} />
              </Button>
              <Button variant="ghost" size="icon" className="text-white" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
