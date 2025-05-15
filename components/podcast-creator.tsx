"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Save, ImageIcon, Music, Video } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CloudinaryUploader from "./cloudinary-uploader"

interface PodcastCreatorProps {
  onSave?: (podcastId: string) => void
}

interface MediaItem {
  url: string
  publicId: string
  resourceType: string
  format: string
}

export default function PodcastCreator({ onSave }: PodcastCreatorProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [host, setHost] = useState("")
  const [categories, setCategories] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [audioUrl, setAudioUrl] = useState("")
  const [audioPublicId, setAudioPublicId] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoPublicId, setVideoPublicId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCoverImageUpload = (result: MediaItem) => {
    setCoverImageUrl(result.url)
  }

  const handleThumbnailUpload = (result: MediaItem) => {
    setThumbnailUrl(result.url)
  }

  const handlePhotoUpload = (result: MediaItem) => {
    setPhotoUrl(result.url)
  }

  const handleAudioUpload = (result: MediaItem) => {
    setAudioUrl(result.url)
    setAudioPublicId(result.publicId)
  }

  const handleVideoUpload = (result: MediaItem) => {
    setVideoUrl(result.url)
    setVideoPublicId(result.publicId)
  }

  const savePodcast = async () => {
    if (!title.trim()) {
      setError("Podcast title is required")
      return
    }

    if (!audioUrl) {
      setError("Audio file is required")
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const podcastData = {
        title,
        description,
        host,
        coverImageUrl,
        thumbnailUrl,
        photoUrl,
        audioUrl,
        audioPublicId,
        videoUrl,
        videoPublicId,
        categories: categories
          .split(",")
          .map((category) => category.trim())
          .filter(Boolean),
      }

      const response = await fetch("/api/podcasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(podcastData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || response.statusText)
      }

      const data = await response.json()
      setSuccess(true)

      // Call the onSave callback if provided
      if (onSave) {
        onSave(data.id)
      }
    } catch (err) {
      console.error("Save error:", err)
      setError(err instanceof Error ? err.message : "Failed to save podcast")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="w-full border border-gray-200 shadow-md dark:border-gray-800 dark:shadow-none bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100">Create New Podcast</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">Start your podcast journey</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="podcast-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Podcast Title
          </label>
          <Input
            id="podcast-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your podcast"
            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="podcast-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <Textarea
            id="podcast-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is your podcast about?"
            className="min-h-[100px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="podcast-host" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Host Name
          </label>
          <Input
            id="podcast-host"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="Who hosts this podcast?"
            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="podcast-categories" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Categories (comma-separated)
          </label>
          <Input
            id="podcast-categories"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="technology, business, education"
            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <Tabs defaultValue="cover" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="cover" className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Cover</span>
            </TabsTrigger>
            <TabsTrigger value="thumbnail" className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Thumbnail</span>
            </TabsTrigger>
            <TabsTrigger value="photo" className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Photo</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cover" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image</label>
              {coverImageUrl && (
                <div className="mb-4">
                  <img
                    src={coverImageUrl || "/placeholder.svg"}
                    alt="Cover"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
              <CloudinaryUploader
                resourceType="image"
                folder="podcasts/covers"
                onUploadSuccess={handleCoverImageUpload}
                accept="image/*"
                buttonText="Upload Cover Image"
              />
            </div>
          </TabsContent>

          <TabsContent value="thumbnail" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail Image</label>
              {thumbnailUrl && (
                <div className="mb-4">
                  <img
                    src={thumbnailUrl || "/placeholder.svg"}
                    alt="Thumbnail"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
              <CloudinaryUploader
                resourceType="image"
                folder="podcasts/thumbnails"
                onUploadSuccess={handleThumbnailUpload}
                accept="image/*"
                buttonText="Upload Thumbnail"
              />
            </div>
          </TabsContent>

          <TabsContent value="photo" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Photo</label>
              {photoUrl && (
                <div className="mb-4">
                  <img
                    src={photoUrl || "/placeholder.svg"}
                    alt="Photo"
                    className="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
              <CloudinaryUploader
                resourceType="image"
                folder="podcasts/photos"
                onUploadSuccess={handlePhotoUpload}
                accept="image/*"
                buttonText="Upload Photo"
              />
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Audio File <span className="text-red-500">*</span>
              </label>
              {audioUrl && (
                <div className="mb-4">
                  <audio src={audioUrl} controls className="w-full" />
                </div>
              )}
              <CloudinaryUploader
                resourceType="auto"
                folder="podcasts/audio"
                onUploadSuccess={handleAudioUpload}
                accept="audio/*"
                buttonText="Upload Audio File"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Required: Upload an audio file for your podcast</p>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Video File (Optional)</label>
              {videoUrl && (
                <div className="mb-4">
                  <video src={videoUrl} controls className="w-full h-48 object-cover rounded-md" />
                </div>
              )}
              <CloudinaryUploader
                resourceType="video"
                folder="podcasts/videos"
                onUploadSuccess={handleVideoUpload}
                accept="video/*"
                buttonText="Upload Video File"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Optional: Upload a video version of your podcast</p>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Podcast created successfully! Now you can add episodes.</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={savePodcast} disabled={saving} className="ml-auto bg-gray-700 hover:bg-gray-800 text-white font-medium shadow-sm">
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Podcast
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
