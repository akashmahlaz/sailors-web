"use client"

import { useRef, useState } from "react"
import { useSession } from "next-auth/react"
import AudioUploader from "@/components/audio-uploader"
import AudioGallery, { type AudioGalleryRef } from "@/components/audio-gallery"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

export default function AudioPage() {
  const { data: session } = useSession()
  const audioGalleryRef = useRef<AudioGalleryRef>(null)
  const [showUploader, setShowUploader] = useState(false)

  const handleUploadSuccess = () => {
    if (audioGalleryRef.current) {
      audioGalleryRef.current.fetchAudios()
    }
    setShowUploader(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-900">Sea Sounds</h1>
          <p className="text-muted-foreground mt-1">Record and share your maritime melodies</p>
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
              <Plus className="mr-2 h-4 w-4" /> Record Shanty
            </>
          )}
        </Button>
      </div>

      {showUploader && (
        <div className="mb-8">
          <AudioUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      <AudioGallery ref={audioGalleryRef} />
    </div>
  )
}
