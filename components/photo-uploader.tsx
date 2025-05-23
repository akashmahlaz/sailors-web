"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, AlertCircle, Upload } from "lucide-react"

interface UploadedMedia {
  url: string
  publicId: string
  resourceType: string
  format: string
}

interface PhotoUploaderProps {
  onUploadSuccess?: (media: UploadedMedia) => void
  saveToGallery?: boolean
}

export default function PhotoUploader({ onUploadSuccess, saveToGallery = true }: PhotoUploaderProps) {
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
      console.log("Getting Cloudinary signature...")
      const signatureResponse = await fetch("/api/cloudinary/signature")

      if (!signatureResponse.ok) {
        let errorMessage = "Failed to get upload signature"
        try {
          const errorData = await signatureResponse.json()
          errorMessage = errorData.error || signatureResponse.statusText
        } catch (e) {
          errorMessage = `Failed to get upload signature: ${signatureResponse.status} ${signatureResponse.statusText}`
        }
        throw new Error(errorMessage)
      }

      // Parse the signature data
      let signatureData
      try {
        signatureData = await signatureResponse.json()
        console.log("Signature data received:", signatureData)
      } catch (e) {
        console.error("Error parsing signature response:", e)
        throw new Error("Invalid signature data received from server")
      }

      const { signature, timestamp, cloudName, apiKey } = signatureData

      if (!signature || !timestamp || !cloudName || !apiKey) {
        throw new Error("Incomplete signature data received from server")
      }

      // Create form data for Cloudinary upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", timestamp.toString())
      formData.append("signature", signature)
      formData.append("resource_type", "image")

      // Upload to Cloudinary with progress tracking
      console.log("Uploading to Cloudinary...")
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
          let response
          try {
            response = JSON.parse(xhr.responseText)
            console.log("Cloudinary upload successful:", response)
          } catch (e) {
            console.error("Error parsing Cloudinary response:", e, "Response:", xhr.responseText)
            throw new Error("Invalid response from Cloudinary")
          }

          // Save photo metadata to our MongoDB database only if saveToGallery is true
          if (saveToGallery) {
            console.log("Saving photo metadata to database...")
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
              let errorMessage = "Failed to save photo metadata"
              try {
                const errorData = await saveResponse.json()
                errorMessage = errorData.error || saveResponse.statusText
              } catch (e) {
                errorMessage = `Failed to save photo metadata: ${saveResponse.status} ${saveResponse.statusText}`
              }
              console.warn(errorMessage)
            } else {
              console.log("Photo metadata saved successfully")
            }
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
            onUploadSuccess({
              url: response.secure_url,
              publicId: response.public_id,
              resourceType: response.resource_type,
              format: response.format,
            })
          }
        } else {
          let errorMessage = "Upload failed"
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.error?.message || "Upload failed"
          } catch (e) {
            errorMessage = `Upload failed with status ${xhr.status}: ${xhr.statusText}`
          }
          throw new Error(errorMessage)
        }
        setUploading(false)
      }

      xhr.onerror = () => {
        console.error("Network error during upload")
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
        <CardTitle>Upload Image </CardTitle>
        <CardDescription>Upload the Quality image</CardDescription>
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
              placeholder="Enter a title for your photo(OPTIONAL)"
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
              placeholder="nature, landscape, vacation (OPTIONAL)"
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
              <span>Photo captured successfully!</span>
            </div>
          )}

          <Button onClick={uploadPhoto} disabled={uploading || !file} className="w-full bg-gray-700 hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-700 dark:hover:text-white">
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload Photo
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
