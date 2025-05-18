"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Upload } from "lucide-react"

interface CloudinaryUploaderProps {
  resourceType?: "image" | "video" | "auto" | "raw"
  folder?: string
  onUploadSuccess: (result: {
    url: string
    publicId: string
    resourceType: string
    format: string
  }) => void
  accept?: string
  buttonText?: string
}

export default function CloudinaryUploader({
  resourceType = "image",
  folder = "",
  onUploadSuccess,
  accept = "*/*",
  buttonText = "Upload File",
}: CloudinaryUploaderProps) {
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

  const uploadFile = async () => {
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
          folder,
          resourceType,
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

      if (!signature || !timestamp || !cloudName || !apiKey) {
        console.error("Missing required signature data:", signatureData)
        throw new Error("Incomplete signature data received")
      }

      // Create form data for Cloudinary upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", timestamp.toString())
      formData.append("signature", signature)

      // Only add folder if it's provided
      if (folder) {
        formData.append("folder", folder)
      }

      // Determine the upload endpoint based on resourceType
      const uploadEndpoint = resourceType === "auto" ? "auto/upload" : `${resourceType}/upload`

      // Upload to Cloudinary with progress tracking
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${uploadEndpoint}`)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setProgress(percentComplete)
        }
      }

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
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
            const fileInput = document.getElementById("file-upload") as HTMLInputElement
            if (fileInput) fileInput.value = ""
          } catch (e) {
            console.error("Error parsing response:", e, "Response text:", xhr.responseText)
            throw new Error("Invalid response from Cloudinary")
          }
        } else {
          let errorMessage = "Upload failed"
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.error?.message || "Upload failed"
          } catch (e) {
            // If we can't parse the error response, use the default message
            console.error("Error parsing error response:", e, "Response text:", xhr.responseText)
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
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <label htmlFor="file-upload" className="text-sm font-medium">
          Select File
        </label>
        <input
          id="file-upload"
          type="file"
          accept={accept}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
          onChange={handleFileChange}
          onClick={(e) => {
            // Prevent any default form submission
            e.preventDefault();
            e.stopPropagation();
          }}
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
          <span>File uploaded successfully!</span>
        </div>
      )}

      <Button onClick={uploadFile} disabled={uploading || !file} className="w-full">
        {uploading ? (
          "Uploading..."
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" /> {buttonText}
          </>
        )}
      </Button>
    </div>
  )
}
