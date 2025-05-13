"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Rewind, FastForward, Download } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PodcastEpisode {
  id: string
  title: string
  description: string
  audio_url: string
  duration: number
  episode_number: number
  season: number
  image_url?: string
}

interface PodcastPlayerProps {
  episode: PodcastEpisode
  onNext?: () => void
  onPrevious?: () => void
}

export default function PodcastPlayer({ episode, onNext, onPrevious }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(episode.duration || 0)
  const [playbackRate, setPlaybackRate] = useState(1)

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime)
    }

    const handleDurationChange = () => {
      setDuration(audioElement.duration)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleVolumeChange = () => {
      setVolume(audioElement.volume)
      setIsMuted(audioElement.muted)
    }

    audioElement.addEventListener("timeupdate", handleTimeUpdate)
    audioElement.addEventListener("durationchange", handleDurationChange)
    audioElement.addEventListener("play", handlePlay)
    audioElement.addEventListener("pause", handlePause)
    audioElement.addEventListener("volumechange", handleVolumeChange)

    return () => {
      audioElement.removeEventListener("timeupdate", handleTimeUpdate)
      audioElement.removeEventListener("durationchange", handleDurationChange)
      audioElement.removeEventListener("play", handlePlay)
      audioElement.removeEventListener("pause", handlePause)
      audioElement.removeEventListener("volumechange", handleVolumeChange)
    }
  }, [episode])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return

    audioRef.current.muted = !isMuted
  }

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return

    const newVolume = value[0]
    audioRef.current.volume = newVolume
    if (newVolume === 0) {
      audioRef.current.muted = true
    } else if (isMuted) {
      audioRef.current.muted = false
    }
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return

    audioRef.current.currentTime = value[0]
  }

  const skipForward = () => {
    if (!audioRef.current) return

    audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 30, duration)
  }

  const skipBackward = () => {
    if (!audioRef.current) return

    audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0)
  }

  const changePlaybackRate = (rate: number) => {
    if (!audioRef.current) return

    audioRef.current.playbackRate = rate
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

  const downloadEpisode = () => {
    // Create a temporary anchor element
    const a = document.createElement("a")
    a.href = episode.audio_url
    a.download = `${episode.title || "episode"}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Card className="w-full overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-0 shadow-lg">
      <div className="relative">
        {/* Episode Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={episode.image_url || "/placeholder.svg?height=720&width=1280&query=podcast%20episode"}
            alt={episode.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Episode Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-2xl font-bold mb-1">{episode.title}</h2>
            <p className="text-sm text-white/80">
              Season {episode.season} • Episode {episode.episode_number}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <audio ref={audioRef} src={episode.audio_url} className="hidden" />

        {/* Player Controls */}
        <div className="bg-gradient-to-r from-cyan-900/10 to-slate-900/10 dark:from-cyan-900/20 dark:to-slate-900/20 p-4 space-y-4">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs w-16 text-right font-mono">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs w-16 font-mono">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onPrevious && (
                <Button variant="ghost" size="icon" onClick={onPrevious} className="text-slate-700 dark:text-slate-200">
                  <SkipBack className="h-5 w-5" />
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={skipBackward} className="text-slate-700 dark:text-slate-200">
                <Rewind className="h-5 w-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={togglePlay}
                className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white shadow-md shadow-cyan-600/20 dark:shadow-cyan-900/20"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
              </Button>

              <Button variant="ghost" size="icon" onClick={skipForward} className="text-slate-700 dark:text-slate-200">
                <FastForward className="h-5 w-5" />
              </Button>

              {onNext && (
                <Button variant="ghost" size="icon" onClick={onNext} className="text-slate-700 dark:text-slate-200">
                  <SkipForward className="h-5 w-5" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={toggleMute} className="text-slate-700 dark:text-slate-200">
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-200">
                    {playbackRate}x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <DropdownMenuItem
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={playbackRate === rate ? "bg-accent" : ""}
                    >
                      {rate === 1 ? "Normal" : `${rate}x`}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={downloadEpisode}
                className="text-slate-700 dark:text-slate-200"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Episode Description */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Episode Details</h3>
          <p className="text-slate-600 dark:text-slate-300">{episode.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
