"use client"

import { useRef, useState } from "react"
import { useSession } from "next-auth/react"
import VideoUploader from "@/components/video-uploader"
import VideoGallery, { type VideoGalleryRef } from "@/components/video-gallery"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

export default function VideosPage() {
  const { data: session } = useSession()
  const videoGalleryRef = useRef<VideoGalleryRef>(null)
  const [showUploader, setShowUploader] = useState(false)

  const handleUploadSuccess = () => {
    if (videoGalleryRef.current) {
      videoGalleryRef.current.fetchVideos()
    }
    setShowUploader(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-900">Sea Shorts</h1>
          <p className="text-muted-foreground mt-1">Capture and share your maritime adventures</p>
        </div>
        <Button
          onClick={() => setShowUploader(!showUploader)}
          className={`${showUploader ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-700 dark:hover:text-white"}`}
        >
          {showUploader ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel Upload
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Capture Voyage
            </>
          )}
        </Button>
      </div>

      {showUploader && (
        <div className="mb-8">
          <VideoUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      <VideoGallery ref={videoGalleryRef} />
    </div>
  )
}
