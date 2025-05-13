"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, Upload, ImageIcon, Video, Music } from "lucide-react"

interface UploadedMedia {
  url: string
  publicId: string
  resourceType: string
  format: string
}

interface MultiMediaUploaderProps {
  onUploadSuccess: (media: UploadedMedia) => void
}

export default function MultiMediaUploader({ onUploadSuccess }: MultiMediaUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio">("image")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const uploadMedia = async () => {
    if (!file) {
      setError(`Please select a ${mediaType} file to upload`)
      return
    }

    try {
      setUploading(true)
      setProgress(0)
      setError(null)
      setSuccess(false)

      // Determine folder based on media type
      const folder = `news/${mediaType}s`

      // Get signature from our API with the correct resource type and folder
      const signatureResponse = await fetch(
        `/api/cloudinary/signature?resource_type=${mediaType === "image" ? "image" : "auto"}&folder=${folder}`,
      )

      if (!signatureResponse.ok) {
        const errorData = await signatureResponse.json()
        throw new Error(`Failed to get upload signature: ${errorData.error || signatureResponse.statusText}`)
      }

      const signatureData = await signatureResponse.json()
      const { signature, timestamp, cloudName, apiKey, folder: signedFolder } = signatureData

      // Create form data for Cloudinary upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", timestamp.toString())
      formData.append("signature", signature)
      formData.append("folder", signedFolder || folder)

      // Set the resource type based on the media type
      const resourceType = mediaType === "image" ? "image" : "auto"

      // Upload to Cloudinary with progress tracking
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setProgress(percentComplete)
        }
      }

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)

          // Call the onUploadSuccess callback with the media details
          onUploadSuccess({
            url: response.secure_url,
            publicId: response.public_id,
            resourceType: response.resource_type,
            format: response.format,
          })

          setSuccess(true)
          setFile(null)

          // Reset file input
          const fileInput = document.getElementById(`${mediaType}-upload`) as HTMLInputElement
          if (fileInput) fileInput.value = ""
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

  const [isPending, setIsPending] = useState(false)

  return (
    <div className="space-y-4">
      <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as "image" | "video" | "audio")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Image</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>Video</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            <span>Audio</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="image-upload" className="text-sm font-medium">
              Select Image
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
        </TabsContent>

        <TabsContent value="video">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="video-upload" className="text-sm font-medium">
              Select Video
            </label>
            <input
              id="video-upload"
              type="file"
              accept="video/*"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
        </TabsContent>

        <TabsContent value="audio">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="audio-upload" className="text-sm font-medium">
              Select Audio
            </label>
            <input
              id="audio-upload"
              type="file"
              accept="audio/*"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
        </TabsContent>
      </Tabs>

      {file && (
        <div className="text-sm">
          Selected: <span className="font-medium">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
        </div>
      )}

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
          <span>{mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} uploaded successfully!</span>
        </div>
      )}

      <Button onClick={uploadMedia} disabled={uploading || !file} className="w-full">
        {uploading ? (
          "Uploading..."
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" /> Upload {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
          </>
        )}
      </Button>
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit"}
      </button>
    </div>
  )
}
