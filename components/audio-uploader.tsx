"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Music } from "lucide-react"

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

  const uploadAudioAndThumbnail = async () => {
    setError(null)
    setThumbnailError(null)
    setSuccess(false)
    setThumbnailSuccess(false)
    setProgress(0)
    setThumbnailProgress(0)
    setUploadedAudioId(null)

    if (!file) {
      setError("Please select an audio file to upload")
      return
    }
    setUploading(true)
    try {
      // 1. Upload audio
      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceType: "audio" }),
      })
      if (!signatureResponse.ok) {
        const errorText = await signatureResponse.text()
        throw new Error(errorText)
      }
      const signatureData = await signatureResponse.json()
      const { signature, timestamp, cloudName, apiKey } = signatureData
      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", timestamp.toString())
      formData.append("signature", signature)
      formData.append("resource_type", "auto")
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100))
          }
        }
        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            let response
            try {
              response = JSON.parse(xhr.responseText)
            } catch (e) {
              setError("Invalid response from Cloudinary")
              reject()
              return
            }
            // Save audio metadata
            try {
              const saveResponse = await fetch("/api/audio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  publicId: response.public_id,
                  url: response.secure_url,
                  resourceType: response.resource_type,
                  format: response.format,
                  duration: response.duration || 0,
                  title: file.name.replace(/\.[^/.]+$/, ""),
                }),
              })
              if (!saveResponse.ok) {
                setError("Failed to save audio metadata")
                reject()
                return
              }
              const saveData = await saveResponse.json()
              setUploadedAudioId(saveData.id)
              // 2. If thumbnail, upload it and update audio
              if (thumbnailFile) {
                const thumbSigRes = await fetch("/api/cloudinary/signature", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ resourceType: "image" }),
                })
                if (!thumbSigRes.ok) {
                  setThumbnailError("Failed to get thumbnail upload signature")
                  reject()
                  return
                }
                const thumbSigData = await thumbSigRes.json()
                const thumbForm = new FormData()
                thumbForm.append("file", thumbnailFile)
                thumbForm.append("api_key", thumbSigData.apiKey)
                thumbForm.append("timestamp", thumbSigData.timestamp.toString())
                thumbForm.append("signature", thumbSigData.signature)
                thumbForm.append("resource_type", "image")
                await new Promise<void>((thumbResolve, thumbReject) => {
                  const thumbXhr = new XMLHttpRequest()
                  thumbXhr.open("POST", `https://api.cloudinary.com/v1_1/${thumbSigData.cloudName}/image/upload`)
                  thumbXhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                      setThumbnailProgress(Math.round((event.loaded / event.total) * 100))
                    }
                  }
                  thumbXhr.onload = async () => {
                    if (thumbXhr.status >= 200 && thumbXhr.status < 300) {
                      let thumbResp
                      try {
                        thumbResp = JSON.parse(thumbXhr.responseText)
                      } catch (e) {
                        setThumbnailError("Invalid response from Cloudinary")
                        thumbReject()
                        return
                      }
                      // Update audio with thumbnail
                      try {
                        const updateResponse = await fetch("/api/audio", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: saveData.id,
                            thumbnailUrl: thumbResp.secure_url,
                          }),
                        })
                        if (!updateResponse.ok) {
                          setThumbnailError("Failed to update audio with thumbnail")
                          thumbReject()
                          return
                        }
                        setThumbnailSuccess(true)
                        thumbResolve()
                      } catch (e) {
                        setThumbnailError("Thumbnail uploaded but audio record could not be updated")
                        thumbReject()
                      }
                    } else {
                      setThumbnailError("Thumbnail upload failed")
                      thumbReject()
                    }
                  }
                  thumbXhr.onerror = () => {
                    setThumbnailError("Network error during thumbnail upload")
                    thumbReject()
                  }
                  thumbXhr.send(thumbForm)
                })
              }
              setSuccess(true)
              resolve()
            } catch (e) {
              setError("Audio uploaded but metadata could not be saved")
              reject()
            }
          } else {
            setError("Audio upload failed")
            reject()
          }
        }
        xhr.onerror = () => {
          setError("Network error during upload")
          reject()
        }
        xhr.send(formData)
      })
      // Reset state and call onUploadSuccess
      setFile(null)
      setThumbnailFile(null)
      setProgress(0)
      setThumbnailProgress(0)
      if (onUploadSuccess) onUploadSuccess()
    } catch (err) {
      // error already set above
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-100">Your Voice</CardTitle>
        <CardDescription className="text-gray-500 dark:text-gray-400">Upload your maritime melodies and custom album art (thumbnail optional)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="audio-upload" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Select Audio File <span className="text-red-500">*</span>
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
          <div className="grid w-full items-center gap-1.5">
            <label htmlFor="thumbnail-upload" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Select Thumbnail Image (optional)
            </label>
            <input
              id="thumbnail-upload"
              type="file"
              accept="image/*"
              className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium text-gray-700 dark:text-gray-200"
              onChange={handleThumbnailChange}
              disabled={uploading}
            />
          </div>
          {file && (
            <div className="text-sm">
              Selected audio: <span className="font-medium">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}
          {thumbnailFile && (
            <div className="text-sm">
              Selected thumbnail: <span className="font-medium">{thumbnailFile.name}</span> ({(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-xs text-center">Audio: {progress}% uploaded</p>
              {thumbnailFile && (
                <>
                  <Progress value={thumbnailProgress} className="h-2 w-full mt-2" />
                  <p className="text-xs text-center">Thumbnail: {thumbnailProgress}% uploaded</p>
                </>
              )}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          {thumbnailError && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{thumbnailError}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Sea shanty and album art uploaded successfully!</span>
            </div>
          )}
          <Button
            onClick={uploadAudioAndThumbnail}
            disabled={uploading || !file}
            className="w-full bg-gray-700 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white"
          >
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                <Music className="mr-2 h-4 w-4" /> Upload Audio
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
