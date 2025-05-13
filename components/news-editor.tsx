"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Save } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CloudinaryUploader from "./cloudinary-uploader"

interface NewsEditorProps {
  initialNews?: {
    id: string
    title: string
    content: string
    summary: string
    cover_image_url?: string
    author?: string
    category?: string
    tags?: string[]
    is_breaking?: boolean
    media_items?: MediaItem[]
  }
  onSave?: (newsId: string) => void
}

interface MediaItem {
  url: string
  publicId: string
  resourceType: string
  format: string
  title?: string
}

const NEWS_CATEGORIES = [
  "World",
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Health",
  "Sports",
  "Entertainment",
  "Education",
  "Environment",
]

export default function NewsEditor({ initialNews, onSave }: NewsEditorProps) {
  const [title, setTitle] = useState(initialNews?.title || "")
  const [content, setContent] = useState(initialNews?.content || "")
  const [summary, setSummary] = useState(initialNews?.summary || "")
  const [author, setAuthor] = useState(initialNews?.author || "")
  const [category, setCategory] = useState(initialNews?.category || "General")
  const [tags, setTags] = useState(initialNews?.tags?.join(", ") || "")
  const [isBreaking, setIsBreaking] = useState(initialNews?.is_breaking || false)
  const [coverImageUrl, setCoverImageUrl] = useState(initialNews?.cover_image_url || "")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(initialNews?.media_items || [])

  const handleCoverImageUpload = (result: MediaItem) => {
    setCoverImageUrl(result.url)
  }

  const handleMediaUpload = (media: { url: string; publicId: string; resourceType: string; format: string }) => {
    setMediaItems([...mediaItems, { ...media, title: "" }])
  }

  const removeMediaItem = (index: number) => {
    const updatedItems = [...mediaItems]
    updatedItems.splice(index, 1)
    setMediaItems(updatedItems)
  }

  const updateMediaItemTitle = (index: number, title: string) => {
    const updatedItems = [...mediaItems]
    updatedItems[index] = { ...updatedItems[index], title }
    setMediaItems(updatedItems)
  }

  const saveNews = async () => {
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

      const newsData = {
        title,
        content,
        summary,
        coverImageUrl,
        author,
        category,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isBreaking,
        mediaItems,
      }

      const url = initialNews ? `/api/news/${initialNews.id}` : "/api/news"
      const method = initialNews ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newsData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to save news article"

        try {
          // Try to parse the error as JSON
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If parsing fails, use the raw text
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      setSuccess(true)

      // Call the onSave callback if provided
      if (onSave) {
        onSave(initialNews?.id || data.id)
      }
    } catch (err) {
      console.error("Save error:", err)
      setError(err instanceof Error ? err.message : "Failed to save news article")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialNews ? "Edit Maritime Report" : "Create Maritime Report"}</CardTitle>
        <CardDescription>Share the latest news from the seven seas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="news-title" className="text-sm font-medium">
            Headline
          </label>
          <Input
            id="news-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a headline for your news article"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="news-summary" className="text-sm font-medium">
            Summary
          </label>
          <Textarea
            id="news-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A brief summary of the article (will appear in listings)"
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="news-content" className="text-sm font-medium">
            Content
          </label>
          <Textarea
            id="news-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your news article content here..."
            className="min-h-[200px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="news-author" className="text-sm font-medium">
              Author
            </label>
            <Input
              id="news-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="news-category" className="text-sm font-medium">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="news-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {NEWS_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="news-tags" className="text-sm font-medium">
            Tags (comma-separated)
          </label>
          <Input
            id="news-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="politics, economy, global"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="breaking-news" checked={isBreaking} onCheckedChange={setIsBreaking} />
          <Label htmlFor="breaking-news">Mark as Breaking News</Label>
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

          <CloudinaryUploader
            resourceType="image"
            folder="news/covers"
            onUploadSuccess={handleCoverImageUpload}
            accept="image/*"
            buttonText="Upload Cover Image"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Media</label>

          {mediaItems.length > 0 && (
            <div className="space-y-4 mb-4">
              <h3 className="text-sm font-medium">Uploaded Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mediaItems.map((item, index) => (
                  <div key={index} className="border rounded-md p-3 space-y-2">
                    {item.resourceType === "image" ? (
                      <img
                        src={item.url || "/placeholder.svg"}
                        alt={item.title || "Media"}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ) : item.resourceType === "video" ? (
                      <video src={item.url} className="w-full h-32 object-cover rounded-md" controls />
                    ) : (
                      <audio src={item.url} className="w-full mt-2" controls />
                    )}

                    <Input
                      placeholder="Media title (optional)"
                      value={item.title || ""}
                      onChange={(e) => updateMediaItemTitle(index, e.target.value)}
                    />

                    <Button variant="destructive" size="sm" onClick={() => removeMediaItem(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CloudinaryUploader
            resourceType="auto"
            folder="news/media"
            onUploadSuccess={handleMediaUpload}
            accept="image/*,video/*,audio/*"
            buttonText="Upload Media"
          />
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
            <span>Maritime report saved successfully!</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={saveNews} disabled={saving} className="ml-auto bg-cyan-600 hover:bg-cyan-700">
          {saving ? (
            "Charting Course..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> {initialNews ? "Update" : "Publish"} Maritime Report
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
