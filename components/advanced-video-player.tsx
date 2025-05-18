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
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isBuffering, setIsBuffering] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isHoveringVolume, setIsHoveringVolume] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const touchStartTimeRef = useRef<number>(0)
  const touchStartXRef = useRef<number>(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewTime, setPreviewTime] = useState(0)
  const [previewPosition, setPreviewPosition] = useState(0)
  const [isPictureInPicture, setIsPictureInPicture] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [showCaptionsMenu, setShowCaptionsMenu] = useState(false)

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
    if (!session?.user?.id) return
    const res = await fetch(`/api/videos/${video.id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: session.user.id }),
    })
    if (res.ok) {
      const data = await res.json()
      setLikeState({ liked: data.liked, likesCount: data.likesCount })
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
      try {
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Playback error:", error)
          })
        }
      } catch (error) {
        console.error("Error during play:", error)
      }
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

  const handleSeekStart = () => {
    setIsDragging(true)
    setShowPreview(true)
  }

  const handleSeekEnd = () => {
    setIsDragging(false)
    setShowPreview(false)
  }

  const handleSeekMove = (value: number[]) => {
    if (!videoRef.current) return
    const time = value[0]
    setPreviewTime(time)
    
    // Calculate preview position
    const rect = videoRef.current.getBoundingClientRect()
    const percentage = time / duration
    setPreviewPosition(percentage * rect.width)
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

    if (isPlaying && !isDragging) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  const handleMouseLeave = () => {
    if (isPlaying && !isDragging) {
      setShowControls(false)
    }
  }

  const changePlaybackRate = (rate: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const downloadVideo = () => {
    const a = document.createElement("a")
    a.href = video.url
    a.download = `${video.title || "video"}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartTimeRef.current = Date.now()
    touchStartXRef.current = e.touches[0].clientX
    setShowControls(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndTime = Date.now()
    const touchEndX = e.changedTouches[0].clientX
    const touchDuration = touchEndTime - touchStartTimeRef.current
    const touchDistance = Math.abs(touchEndX - touchStartXRef.current)

    if (touchDuration < 200 && touchDistance < 10) {
      togglePlay()
    }

    if (isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  const handleTouchMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
  }

  const skipForward = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration)
  }

  const skipBackward = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0)
  }

  const togglePictureInPicture = async () => {
    if (!videoRef.current) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPictureInPicture(false)
      } else {
        await videoRef.current.requestPictureInPicture()
        setIsPictureInPicture(true)
      }
    } catch (error) {
      console.error("Error toggling Picture-in-Picture:", error)
    }
  }

  const handlePictureInPictureChange = () => {
    setIsPictureInPicture(!!document.pictureInPictureElement)
  }

  useEffect(() => {
    document.addEventListener("enterpictureinpicture", handlePictureInPictureChange)
    document.addEventListener("leavepictureinpicture", handlePictureInPictureChange)

    return () => {
      document.removeEventListener("enterpictureinpicture", handlePictureInPictureChange)
      document.removeEventListener("leavepictureinpicture", handlePictureInPictureChange)
    }
  }, [])

  const handleShare = async () => {
    const shareUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.title,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied",
        description: "Video link copied to clipboard",
      })
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black aspect-video select-none"
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-contain"
        poster={video.thumbnail_url || `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/so_0/${video.public_id}.jpg`}
        onClick={togglePlay}
        controls={false}
        preload="metadata"
        crossOrigin="anonymous"
        playsInline
      />

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

      {/* Preview thumbnail */}
      {showPreview && (
        <div
          className="absolute bottom-16 left-0 w-32 h-20 bg-black rounded overflow-hidden pointer-events-none"
          style={{ left: `${previewPosition - 64}px` }}
        >
          <video
            src={video.url}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
            {formatTime(previewTime)}
          </div>
        </div>
      )}

      {/* Video Controls */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between pointer-events-none z-30 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Top Bar (mobile/desktop) */}
        <div className="flex justify-between items-center px-2 pt-2 md:px-4 md:pt-4 pointer-events-auto">
          {/* Left: (optional) back/close button */}
          <div></div>
          {/* Right: icons */}
          <div className="flex gap-2 md:gap-3">
            <Button variant="ghost" size="icon" className="text-white bg-black/40 hover:bg-black/60" tabIndex={-1}><PictureInPicture className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="text-white bg-black/40 hover:bg-black/60" tabIndex={-1}><Captions className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="text-white bg-black/40 hover:bg-black/60" tabIndex={-1}><Settings className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="text-white bg-black/40 hover:bg-black/60" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {/* Center Controls (mobile only, fade on desktop) */}
        <div className="flex-1 flex items-center justify-center pointer-events-auto">
          <div className="flex items-center gap-8 md:gap-4">
            <Button variant="ghost" size="icon" className="text-white bg-black/40 hover:bg-black/60 md:hidden" tabIndex={-1}><svg width="32" height="32" fill="none"><path d="M20 8l-8 8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></Button>
            <Button variant="ghost" size="icon" className="text-white bg-black/60 hover:bg-black/80 !h-16 !w-16 md:!h-10 md:!w-10" onClick={togglePlay} tabIndex={-1}>
              {isPlaying ? <Pause className="h-8 w-8 md:h-5 md:w-5" /> : <Play className="h-8 w-8 md:h-5 md:w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-white bg-black/40 hover:bg-black/60 md:hidden" tabIndex={-1}><svg width="32" height="32" fill="none"><path d="M12 8l8 8-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></Button>
          </div>
        </div>
        {/* Bottom Controls */}
        <div className="w-full flex flex-col gap-1 pb-2 md:pb-4 pointer-events-auto">
          {/* Progress Bar */}
          <div className="relative w-full h-2 md:h-2 flex items-center">
            <div className="absolute left-0 top-0 h-1 w-full bg-white/20 rounded-full" />
            <div className="absolute left-0 top-0 h-1 bg-red-600 rounded-full" style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
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
          <div className="flex items-center justify-between px-2 md:px-4 gap-2 md:gap-4">
            {/* Left: Play, Volume, Time */}
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="text-white" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <div className="flex items-center gap-1 relative">
                <Button variant="ghost" size="icon" className="text-white" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <div className="hidden md:block w-20">
                  <Slider value={[isMuted ? 0 : volume]} min={0} max={1} step={0.01} onValueChange={handleVolumeChange} />
                </div>
              </div>
              <span className="text-xs text-white tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            {/* Right: CC, Settings, PiP, Fullscreen, Share */}
            <div className="flex items-center gap-2 md:gap-3">
              <Button variant="ghost" size="icon" className="text-white" tabIndex={-1}><Captions className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="text-white" tabIndex={-1}><Settings className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="text-white" tabIndex={-1}><PictureInPicture className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="text-white" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-white" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Landscape Mode Button */}
      <div className="absolute top-2 right-2 sm:hidden">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white h-8 w-8 bg-black/50 hover:bg-black/70"
                onClick={() => {
                  toast({
                    title: "Landscape mode",
                    description: "Please rotate your device manually.",
                  })
                }}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rotate to landscape</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Double-tap indicators */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="text-white text-4xl font-bold">-10s</div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="text-white text-4xl font-bold">+10s</div>
        </div>
      </div>

      {/* Like Button */}
      <div className="flex items-center gap-2 mt-4">
        <Button
          variant={likeState.liked ? "default" : "outline"}
          size="icon"
          onClick={handleLike}
          aria-label={likeState.liked ? "Unlike" : "Like"}
          disabled={!session?.user?.id}
        >
          <Heart className={likeState.liked ? "text-red-500 fill-red-500" : ""} />
        </Button>
        <span className="text-sm text-gray-600 dark:text-gray-300">{likeState.likesCount} Likes</span>
      </div>
    </div>
  )
}
