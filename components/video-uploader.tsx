"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"

interface VideoUploaderProps {
  onUploadSuccess?: () => void
}

export default function VideoUploader({ onUploadSuccess }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
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

  const uploadVideo = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    try {
      setUploading(true)
      setProgress(0)
      setError(null)
      setSuccess(false)

      // Get signature from our API
      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceType: "video",
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
            // Save video metadata to our MongoDB database
            const saveResponse = await fetch("/api/videos", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                publicId: response.public_id,
                url: response.secure_url,
                resourceType: response.resource_type,
              }),
            })

            if (!saveResponse.ok) {
              const saveErrorText = await saveResponse.text()
              console.warn("Video uploaded to Cloudinary but metadata could not be saved to database:", saveErrorText)
              throw new Error("Failed to save video metadata")
            }

            await saveResponse.json() // Ensure we can parse the response
          } catch (e) {
            console.error("Error saving video metadata:", e)
            throw new Error("Video uploaded but metadata could not be saved")
          }

          setSuccess(true)
          setFile(null)
          // Reset file input
          const fileInput = document.getElementById("video-upload") as HTMLInputElement
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Capture the Seas</CardTitle>
        <CardDescription>Upload your maritime adventures without size limits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
              <span>Voyage recorded successfully!</span>
            </div>
          )}

          <Button onClick={uploadVideo} disabled={uploading || !file} className="w-full bg-cyan-600 hover:bg-cyan-700">
            {uploading ? (
              "Setting Sail..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Chart Your Course
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
