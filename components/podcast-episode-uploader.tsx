"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, AlertCircle, Upload } from "lucide-react"

interface PodcastEpisodeUploaderProps {
  podcastId: string
  onUploadSuccess?: () => void
}

export default function PodcastEpisodeUploader({ podcastId, onUploadSuccess }: PodcastEpisodeUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [episodeNumber, setEpisodeNumber] = useState(1)
  const [season, setSeason] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Auto-fill title from filename (without extension)
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
      }

      setError(null)
    }
  }

  const uploadEpisode = async () => {
    if (!file) {
      setError("Please select an audio file")
      return
    }

    if (!title.trim()) {
      setError("Episode title is required")
      return
    }

    try {
      setUploading(true)
      setProgress(0)
      setError(null)
      setSuccess(false)

      // Get signature from our API
      const signatureResponse = await fetch("/api/cloudinary/signature")

      if (!signatureResponse.ok) {
        const errorData = await signatureResponse.json()
        throw new Error(`Failed to get upload signature: ${errorData.error || signatureResponse.statusText}`)
      }

      const signatureData = await signatureResponse.json()
      const { signature, timestamp, cloudName, apiKey } = signatureData

      // Create form data for Cloudinary upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", timestamp.toString())
      formData.append("signature", signature)
      formData.append("resource_type", "auto") // Allow any resource type
      formData.append("folder", "podcasts") // Store in podcasts folder

      // Upload to Cloudinary with progress tracking
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setProgress(percentComplete)
        }
      }

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)

          // Save episode metadata to our MongoDB database
          const saveResponse = await fetch(`/api/podcasts/${podcastId}/episodes`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              description,
              audioUrl: response.secure_url,
              publicId: response.public_id,
              duration: response.duration || 0,
              episodeNumber,
              season,
            }),
          })

          if (!saveResponse.ok) {
            console.warn("Audio uploaded to Cloudinary but episode metadata could not be saved to database")
            const errorData = await saveResponse.json()
            throw new Error(errorData.error || saveResponse.statusText)
          }

          setSuccess(true)
          setFile(null)
          setTitle("")
          setDescription("")

          // Reset file input
          const fileInput = document.getElementById("episode-upload") as HTMLInputElement
          if (fileInput) fileInput.value = ""

          // Call the onUploadSuccess callback if provided
          if (onUploadSuccess) {
            onUploadSuccess()
          }
        } else {
          let errorMessage = "Upload failed"
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.error?.message || "Upload failed"
          } catch (e) {
            // If we can't parse the error response, use the default message
          }
          throw new Error(errorMessage)
        }
        setUploading(false)
      }

      xhr.onerror = () => {
        setError("Network error during upload")
        setUploading(false)
      }

      xhr.send(formData)
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload failed")
      setUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Record Sea Tale</CardTitle>
        <CardDescription>Add a new episode to your sea waves</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="episode-upload" className="text-sm font-medium">
              Select Audio File
            </label>
            <input
              id="episode-upload"
              type="file"
              accept="audio/*"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {file && (
            <div className="text-sm">
              Selected: <span className="font-medium">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="episode-title" className="text-sm font-medium">
              Episode Title
            </label>
            <Input
              id="episode-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this episode"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="episode-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="episode-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this episode about?"
              disabled={uploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="episode-number" className="text-sm font-medium">
                Episode Number
              </label>
              <Input
                id="episode-number"
                type="number"
                min="1"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(Number.parseInt(e.target.value) || 1)}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="season-number" className="text-sm font-medium">
                Season
              </label>
              <Input
                id="season-number"
                type="number"
                min="1"
                value={season}
                onChange={(e) => setSeason(Number.parseInt(e.target.value) || 1)}
                disabled={uploading}
              />
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-xs text-center">{progress}% uploaded</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Sea tale recorded successfully!</span>
            </div>
          )}

          <Button
            onClick={uploadEpisode}
            disabled={uploading || !file}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            {uploading ? (
              "Setting Sail..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Record Sea Tale
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
