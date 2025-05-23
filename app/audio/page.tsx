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
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Sounds</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Record and share your maritime melodies</p>
        </div>
        <Button
          onClick={() => setShowUploader(!showUploader)}
          className={`w-full sm:w-auto flex items-center justify-center ${showUploader ? "bg-gray-500 hover:bg-gray-600" : "bg-gray-700 hover:bg-gray-800"} text-white transition-colors`}
        >
          {showUploader ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Share 
            </>
          )}
        </Button>
      </div>

      {showUploader && (
        <div className="mb-8">
          <AudioUploader onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-2 sm:p-4">
        <AudioGallery ref={audioGalleryRef} />
      </div>
    </div>
  )
}
