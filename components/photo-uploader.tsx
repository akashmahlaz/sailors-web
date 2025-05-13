"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, AlertCircle, Upload } from "lucide-react"

interface PhotoUploaderProps {
  onUploadSuccess?: () => void
}

export default function PhotoUploader({ onUploadSuccess }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
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

  const uploadPhoto = async () => {
    if (!file) {
      setError("Please select a photo to upload")
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
      formData.append("resource_type", "image")

      // Upload to Cloudinary with progress tracking
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setProgress(percentComplete)
        }
      }

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)

          // Save photo metadata to our MongoDB database
          const saveResponse = await fetch("/api/photos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              publicId: response.public_id,
              url: response.secure_url,
              title: title || file.name.replace(/\.[^/.]+$/, ""),
              description,
              tags: tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            }),
          })

          if (!saveResponse.ok) {
            console.warn("Photo uploaded to Cloudinary but metadata could not be saved to database")
          }

          setSuccess(true)
          setFile(null)
          setTitle("")
          setDescription("")
          setTags("")

          // Reset file input
          const fileInput = document.getElementById("photo-upload") as HTMLInputElement
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Capture the Horizon</CardTitle>
        <CardDescription>Upload your maritime moments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="photo-upload" className="text-sm font-medium">
              Select Photo
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
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
            <label htmlFor="photo-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="photo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your photo"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="photo-description" className="text-sm font-medium">
              Description (optional)
            </label>
            <Textarea
              id="photo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description"
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="photo-tags" className="text-sm font-medium">
              Tags (optional, comma-separated)
            </label>
            <Input
              id="photo-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="nature, landscape, vacation"
              disabled={uploading}
            />
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
              <span>Maritime moment captured successfully!</span>
            </div>
          )}

          <Button onClick={uploadPhoto} disabled={uploading || !file} className="w-full bg-cyan-600 hover:bg-cyan-700">
            {uploading ? (
              "Charting Course..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Chart the View
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
