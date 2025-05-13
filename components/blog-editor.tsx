"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Save } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface BlogEditorProps {
  initialBlog?: {
    id: string
    title: string
    content: string
    cover_image_url?: string
    tags?: string[]
  }
  onSave?: (blogId: string) => void
}

export default function BlogEditor({ initialBlog, onSave }: BlogEditorProps) {
  const [title, setTitle] = useState(initialBlog?.title || "")
  const [content, setContent] = useState(initialBlog?.content || "")
  const [tags, setTags] = useState(initialBlog?.tags?.join(", ") || "")
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImageUrl, setCoverImageUrl] = useState(initialBlog?.cover_image_url || "")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImageFile(e.target.files[0])
      setError(null)
    }
  }

  const uploadCoverImage = async () => {
    if (!coverImageFile) {
      setError("Please select an image file")
      return
    }

    try {
      setUploading(true)
      setProgress(0)
      setError(null)

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
      formData.append("file", coverImageFile)
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
          setCoverImageUrl(response.secure_url)
          setCoverImageFile(null)

          // Reset file input
          const fileInput = document.getElementById("cover-image-upload") as HTMLInputElement
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

  const saveBlog = async () => {
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!content.trim()) {
      setError("Content is required")
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const blogData = {
        title,
        content,
        coverImageUrl,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      const url = initialBlog ? `/api/blogs/${initialBlog.id}` : "/api/blogs"
      const method = initialBlog ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || response.statusText)
      }

      const data = await response.json()
      setSuccess(true)

      // Call the onSave callback if provided
      if (onSave) {
        onSave(initialBlog?.id || data.id)
      }
    } catch (err) {
      console.error("Save error:", err)
      setError(err instanceof Error ? err.message : "Failed to save blog post")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialBlog ? "Edit Captain's Log" : "Create New Captain's Log"}</CardTitle>
        <CardDescription>Share your maritime tales and adventures</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="blog-title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="blog-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your blog post"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="blog-content" className="text-sm font-medium">
            Content
          </label>
          <Textarea
            id="blog-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog post content here..."
            className="min-h-[200px]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="blog-tags" className="text-sm font-medium">
            Tags (comma-separated)
          </label>
          <Input
            id="blog-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="technology, tutorial, news"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Image</label>

          {coverImageUrl && (
            <div className="mb-4">
              <img
                src={coverImageUrl || "/placeholder.svg"}
                alt="Cover"
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
                onChange={handleCoverImageChange}
                disabled={uploading}
              />
            </div>
            <Button onClick={uploadCoverImage} disabled={uploading || !coverImageFile}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-xs text-center">{progress}% uploaded</p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>Captain's log saved successfully!</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={saveBlog} disabled={saving} className="ml-auto bg-cyan-600 hover:bg-cyan-700">
          {saving ? (
            "Charting Course..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> {initialBlog ? "Update" : "Publish"} Captain's Log
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
