"use client"

import { useRef, useState } from "react"
import { useSession } from "next-auth/react"
import PhotoUploader from "@/components/photo-uploader"
import PhotoGallery, { type PhotoGalleryRef } from "@/components/photo-gallery"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

export default function PhotosPage() {
  const { data: session } = useSession()
  const photoGalleryRef = useRef<PhotoGalleryRef>(null)
  const [showUploader, setShowUploader] = useState(false)

  const handleUploadSuccess = () => {
    if (photoGalleryRef.current) {
      photoGalleryRef.current.fetchPhotos()
    }
    setShowUploader(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-900">Sea Snaps</h1>
          <p className="text-muted-foreground mt-1">Capture and share your maritime moments</p>
        </div>
        <Button
          onClick={() => setShowUploader(!showUploader)}
          className={`${showUploader ? "bg-red-500 hover:bg-red-600" : "bg-cyan-600 hover:bg-cyan-700"}`}
        >
          {showUploader ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel Upload
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Capture Moment
            </>
          )}
        </Button>
      </div>

      {showUploader && (
        <div className="mb-8">
          <PhotoUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      <PhotoGallery ref={photoGalleryRef} />
    </div>
  )
}
