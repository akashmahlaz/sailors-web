"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Upload, X, ImageIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface VideoUploaderProps {
  onUploadSuccess: () => void
}

export default function VideoUploader({ onUploadSuccess }: VideoUploaderProps) {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [useCustomThumbnail, setUseCustomThumbnail] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type.startsWith("video/")) {
        setFile(selectedFile)
        setError(null)
        // Auto-generate title from filename if not set
        if (!title) {
          const fileName = selectedFile.name.replace(/\.[^/.]+$/, "") // Remove extension
          setTitle(fileName.replace(/-|_/g, " ")) // Replace dashes and underscores with spaces
        }
      } else {
        setError("Please select a valid video file")
        setFile(null)
      }
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type.startsWith("image/")) {
        setThumbnailFile(selectedFile)
        setError(null)

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setThumbnailPreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setError("Please select a valid image file for thumbnail")
        setThumbnailFile(null)
        setThumbnailPreview(null)
      }
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files?.[0]
      if (droppedFile) {
        if (droppedFile.type.startsWith("video/")) {
          setFile(droppedFile)
          setError(null)
          // Auto-generate title from filename if not set
          if (!title) {
            const fileName = droppedFile.name.replace(/\.[^/.]+$/, "") // Remove extension
            setTitle(fileName.replace(/-|_/g, " ")) // Replace dashes and underscores with spaces
          }
        } else {
          setError("Please select a valid video file")
        }
      }
    },
    [title],
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a video file")
      return
    }

    if (!title.trim()) {
      setError("Please enter a title for your video")
      return
    }

    try {
      setUploading(true)
      setError(null)
      setUploadProgress(0)

      // Upload video using our server-side API route
      const videoFormData = new FormData()
      videoFormData.append("file", file)
      videoFormData.append("folder", "videos")
      videoFormData.append("resourceType", "video")

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/cloudinary/upload")

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      }

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const videoData = JSON.parse(xhr.responseText)

          // Handle thumbnail upload if custom thumbnail is selected
          let thumbnailPublicId = null
          let thumbnailUrl = null

          if (useCustomThumbnail && thumbnailFile) {
            // Upload thumbnail using our server-side API route
            const thumbnailFormData = new FormData()
            thumbnailFormData.append("file", thumbnailFile)
            thumbnailFormData.append("folder", "video_thumbnails")
            thumbnailFormData.append("resourceType", "image")

            const thumbnailResponse = await fetch("/api/cloudinary/upload", {
              method: "POST",
              body: thumbnailFormData,
            })

            if (!thumbnailResponse.ok) {
              throw new Error("Failed to upload thumbnail")
            }

            const thumbnailData = await thumbnailResponse.json()
            thumbnailPublicId = thumbnailData.public_id
            thumbnailUrl = thumbnailData.secure_url
          }

          // Save video metadata to our database
          const metadataResponse = await fetch("/api/videos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              publicId: videoData.public_id,
              url: videoData.secure_url,
              resourceType: "video",
              title: title,
              description: description,
              thumbnailPublicId: thumbnailPublicId,
              thumbnailUrl: thumbnailUrl,
              userId: session?.user?.id || "anonymous",
              userName: session?.user?.name || "Anonymous User",
              userImage: session?.user?.image || null,
            }),
          })

          if (!metadataResponse.ok) {
            throw new Error("Failed to save video metadata")
          }

          setUploading(false)
          setFile(null)
          setTitle("")
          setDescription("")
          setThumbnailFile(null)
          setThumbnailPreview(null)
          setUseCustomThumbnail(false)
          if (fileInputRef.current) fileInputRef.current.value = ""
          if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
          onUploadSuccess()
        } else {
          throw new Error("Upload failed")
        }
      }

      xhr.onerror = () => {
        setUploading(false)
        setError("Upload failed. Please try again.")
      }

      xhr.send(videoFormData)
    } catch (err) {
      setUploading(false)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Upload error:", err)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>Share your maritime adventures with the community</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your video"
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your video (optional)"
            disabled={uploading}
            rows={3}
          />
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            file ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-gray-300 dark:border-gray-700"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {file ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <video className="max-h-48 rounded" src={URL.createObjectURL(file)} />
              </div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                disabled={uploading}
              >
                <X className="mr-2 h-4 w-4" /> Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <Upload className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-sm font-medium">Drag and drop your video here or click to browse</p>
              <p className="text-xs text-muted-foreground">MP4, MOV, or WebM up to 100MB</p>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                Select Video
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="use-custom-thumbnail"
            checked={useCustomThumbnail}
            onCheckedChange={(checked) => {
              setUseCustomThumbnail(checked === true)
              if (!checked) {
                setThumbnailFile(null)
                setThumbnailPreview(null)
                if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
              }
            }}
            disabled={uploading}
          />
          <Label htmlFor="use-custom-thumbnail">Use custom thumbnail</Label>
        </div>

        {useCustomThumbnail && (
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail Image</Label>
            {thumbnailPreview ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <img
                    src={thumbnailPreview || "/placeholder.svg"}
                    alt="Thumbnail preview"
                    className="max-h-32 rounded"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setThumbnailFile(null)
                    setThumbnailPreview(null)
                    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
                  }}
                  disabled={uploading}
                >
                  <X className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploading}
                >
                  <ImageIcon className="mr-2 h-4 w-4" /> Select Thumbnail
                </Button>
              </div>
            )}
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailChange}
              disabled={uploading}
            />
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? "Uploading..." : "Upload Video"}
        </Button>
      </CardFooter>
    </Card>
  )
}
