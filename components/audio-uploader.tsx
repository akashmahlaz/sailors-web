"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, Music, ImageIcon } from "lucide-react"

interface AudioUploaderProps {
  onUploadSuccess?: () => void
}

export default function AudioUploader({ onUploadSuccess }: AudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploadedAudioId, setUploadedAudioId] = useState<string | null>(null)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [thumbnailProgress, setThumbnailProgress] = useState(0)
  const [thumbnailError, setThumbnailError] = useState<string | null>(null)
  const [thumbnailSuccess, setThumbnailSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0])
      setThumbnailError(null)
    }
  }

  const uploadAudio = async () => {
    if (!file) {
      setError("Please select an audio file to upload")
      return
    }

    try {
      setUploading(true)
      setProgress(0)
      setError(null)
      setSuccess(false)
      setUploadedAudioId(null)

      // Get signature from our API
      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceType: "audio",
        }),
      })

      if (!signatureResponse.ok) {
        const errorText = await signatureResponse.text()
        console.error("Signature response error:", errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(`Failed to get upload signature: ${errorData.error || signatureResponse.statusText}`)
        } catch (e) {
          throw new Error(`Failed to get upload signature: ${signatureResponse.statusText}`)
        }
      }

      let signatureData
      try {
        signatureData = await signatureResponse.json()
      } catch (e) {
        console.error("Error parsing signature response:", e)
        throw new Error("Invalid response from signature endpoint")
      }

      const { signature, timestamp, cloudName, apiKey } = signatureData

      // Validate the signature response
      if (!signature) {
        throw new Error("Missing signature in response")
      }
      if (!timestamp) {
        throw new Error("Missing timestamp in response")
      }
      if (!cloudName) {
        throw new Error("Missing cloudName in response")
      }
      if (!apiKey) {
        throw new Error("Missing apiKey in response")
      }

      // Create form data for Cloudinary upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", timestamp.toString())
      formData.append("signature", signature)
      formData.append("resource_type", "auto") // Allow any resource type

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
          let response
          try {
            response = JSON.parse(xhr.responseText)
          } catch (e) {
            console.error("Error parsing Cloudinary response:", e, "Response text:", xhr.responseText)
            throw new Error("Invalid response from Cloudinary")
          }

          try {
            // Save audio metadata to our MongoDB database
            const saveResponse = await fetch("/api/audio", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                publicId: response.public_id,
                url: response.secure_url,
                resourceType: response.resource_type,
                format: response.format,
                duration: response.duration || 0,
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
              }),
            })

            if (!saveResponse.ok) {
              const saveErrorText = await saveResponse.text()
              console.warn("Audio uploaded to Cloudinary but metadata could not be saved to database:", saveErrorText)
              throw new Error("Failed to save audio metadata")
            }

            const saveData = await saveResponse.json()
            setUploadedAudioId(saveData.id)
          } catch (e) {
            console.error("Error saving audio metadata:", e)
            throw new Error("Audio uploaded but metadata could not be saved")
          }

          setSuccess(true)
          setFile(null)
          // Reset file input
          const fileInput = document.getElementById("audio-upload") as HTMLInputElement
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
            console.error("Error parsing Cloudinary error response:", e, "Response text:", xhr.responseText)
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

  const uploadThumbnail = async () => {
    if (!thumbnailFile) {
      setThumbnailError("Please select an image file")
      return
    }

    if (!uploadedAudioId) {
      setThumbnailError("Please upload an audio file first")
      return
    }

    try {
      setThumbnailUploading(true)
      setThumbnailProgress(0)
      setThumbnailError(null)
      setThumbnailSuccess(false)

      // Get signature from our API
      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceType: "image",
        }),
      })

      if (!signatureResponse.ok) {
        const errorText = await signatureResponse.text()
        console.error("Signature response error:", errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(`Failed to get upload signature: ${errorData.error || signatureResponse.statusText}`)
        } catch (e) {
          throw new Error(`Failed to get upload signature: ${signatureResponse.statusText}`)
        }
      }

      let signatureData
      try {
        signatureData = await signatureResponse.json()
      } catch (e) {
        console.error("Error parsing signature response:", e)
        throw new Error("Invalid response from signature endpoint")
      }

      const { signature, timestamp, cloudName, apiKey } = signatureData

      // Create form data for Cloudinary upload
      const formData = new FormData()
      formData.append("file", thumbnailFile)
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
          setThumbnailProgress(percentComplete)
        }
      }

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let response
          try {
            response = JSON.parse(xhr.responseText)
          } catch (e) {
            console.error("Error parsing Cloudinary response:", e, "Response text:", xhr.responseText)
            throw new Error("Invalid response from Cloudinary")
          }

          try {
            // Update the audio record with the thumbnail URL
            const updateResponse = await fetch("/api/audio", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: uploadedAudioId,
                thumbnailUrl: response.secure_url,
              }),
            })

            if (!updateResponse.ok) {
              const updateErrorText = await updateResponse.text()
              console.warn("Thumbnail uploaded to Cloudinary but audio record could not be updated:", updateErrorText)
              throw new Error("Failed to update audio with thumbnail")
            }

            await updateResponse.json() // Ensure we can parse the response
          } catch (e) {
            console.error("Error updating audio with thumbnail:", e)
            throw new Error("Thumbnail uploaded but audio record could not be updated")
          }

          setThumbnailSuccess(true)
          setThumbnailFile(null)
          // Reset file input
          const fileInput = document.getElementById("thumbnail-upload") as HTMLInputElement
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
            console.error("Error parsing Cloudinary error response:", e, "Response text:", xhr.responseText)
          }
          throw new Error(errorMessage)
        }
        setThumbnailUploading(false)
      }

      xhr.onerror = () => {
        console.error("Network error during upload")
        setThumbnailError("Network error during upload")
        setThumbnailUploading(false)
      }

      xhr.send(formData)
    } catch (err) {
      console.error("Thumbnail upload error:", err)
      setThumbnailError(err instanceof Error ? err.message : "Upload failed")
      setThumbnailUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-100">Record Sea Shanties</CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">Upload your maritime melodies and custom album art</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="audio" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <TabsTrigger value="audio" className="text-gray-700 dark:text-gray-200">Audio File</TabsTrigger>
            <TabsTrigger value="thumbnail" disabled={!uploadedAudioId} className="text-gray-700 dark:text-gray-200">
              Thumbnail
            </TabsTrigger>
          </TabsList>
          <TabsContent value="audio" className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="audio-upload" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Select Audio File
              </label>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium text-gray-700 dark:text-gray-200"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>

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
                <span>Sea shanty recorded successfully! You can now add album art.</span>
              </div>
            )}

            <Button
              onClick={uploadAudio}
              disabled={uploading || !file}
              className="w-full bg-gray-700 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white"
            >
              {uploading ? (
                "Setting Sail..."
              ) : (
                <>
                  <Music className="mr-2 h-4 w-4" /> Record Shanty
                </>
              )}
            </Button>
          </TabsContent>
          <TabsContent value="thumbnail" className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <label htmlFor="thumbnail-upload" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Select Thumbnail Image
              </label>
              <input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium text-gray-700 dark:text-gray-200"
                onChange={handleThumbnailChange}
                disabled={thumbnailUploading}
              />
            </div>

            {thumbnailFile && (
              <div className="text-sm">
                Selected: <span className="font-medium">{thumbnailFile.name}</span> (
                {(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}

            {thumbnailUploading && (
              <div className="space-y-2">
                <Progress value={thumbnailProgress} className="h-2 w-full" />
                <p className="text-xs text-center">{thumbnailProgress}% uploaded</p>
              </div>
            )}

            {thumbnailError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{thumbnailError}</span>
              </div>
            )}

            {thumbnailSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Thumbnail uploaded successfully!</span>
              </div>
            )}

            <Button onClick={uploadThumbnail} disabled={thumbnailUploading || !thumbnailFile} className="w-full bg-gray-700 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white">
              {thumbnailUploading ? (
                "Uploading..."
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" /> Upload Thumbnail
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
