"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Upload, X } from "lucide-react"
import CloudinaryUploader from "@/components/cloudinary-uploader"

interface UploadedMedia {
  url: string
  publicId: string
  resourceType: string
  format: string
}

export default function ProfileEditForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form fields
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [website, setWebsite] = useState("")

  useEffect(() => {
    if (!session) {
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/users/profile")

        if (response.ok) {
          const data = await response.json()
          setProfile(data)

          // Initialize form fields
          setName(data.name || "")
          setBio(data.bio || "")
          setLocation(data.location || "")
          setProfileImage(data.profileImage || "")
          setCoverImage(data.coverImage || "")
          setWebsite(data.socialLinks?.website || "")
        } else {
          // Profile doesn't exist yet, create a new one
          const createResponse = await fetch("/api/users/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          })

          if (createResponse.ok) {
            // Fetch the newly created profile
            const newProfileResponse = await fetch("/api/users/profile")
            const newProfile = await newProfileResponse.json()
            setProfile(newProfile)

            // Initialize form fields
            setName(newProfile.name || session?.user?.name || "")
            setProfileImage(newProfile.profileImage || session?.user?.image || "")
          } else {
            throw new Error("Failed to create profile")
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session])

  const handleProfileImageUpload = (media: UploadedMedia) => {
    setProfileImage(media.url)
  }

  const handleCoverImageUpload = (media: UploadedMedia) => {
    setCoverImage(media.url)
  }

  const handleRemoveProfileImage = () => {
    setProfileImage("")
  }

  const handleRemoveCoverImage = () => {
    setCoverImage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      const updates = {
        name,
        bio,
        location,
        profileImage,
        coverImage,
        socialLinks: {
          website,
        },
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update profile")
      }

      setSuccess(true)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/profile/${session.user?.id}`)
      }, 2000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-slate-50 dark:from-slate-900 dark:to-cyan-950 border-b border-cyan-100 dark:border-cyan-900">
          <CardTitle className="text-cyan-900 dark:text-cyan-100">Edit Your Profile</CardTitle>
          <CardDescription>Update your personal information and profile images</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-900">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your profile has been updated successfully. Redirecting to your profile...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-cyan-200 dark:border-cyan-900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                className="border-cyan-200 dark:border-cyan-900"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., 'Pacific Ocean' or 'San Francisco, CA'"
                className="border-cyan-200 dark:border-cyan-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="border-cyan-200 dark:border-cyan-900"
              />
            </div>

            <div className="space-y-2">
              <Label>Profile Image</Label>
              <div className="border border-cyan-200 dark:border-cyan-900 rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                {profileImage ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Current profile image</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveProfileImage}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-900"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Upload a profile image (recommended size: 400x400)
                    </p>
                    <CloudinaryUploader
                      onUploadSuccess={handleProfileImageUpload}
                      uploadPreset={process.env.NEXT_PUBLIC_UPLOAD_PRESET || ""}
                      resourceType="image"
                    >
                      <Button type="button" variant="outline" className="border-cyan-200 dark:border-cyan-900">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Profile Image
                      </Button>
                    </CloudinaryUploader>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="border border-cyan-200 dark:border-cyan-900 rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                {coverImage ? (
                  <div className="space-y-4">
                    <img
                      src={coverImage || "/placeholder.svg"}
                      alt="Cover"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Current cover image</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveCoverImage}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-900"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Upload a cover image (recommended size: 1500x500)
                    </p>
                    <CloudinaryUploader
                      onUploadSuccess={handleCoverImageUpload}
                      uploadPreset={process.env.NEXT_PUBLIC_UPLOAD_PRESET || ""}
                      resourceType="image"
                    >
                      <Button type="button" variant="outline" className="border-cyan-200 dark:border-cyan-900">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Cover Image
                      </Button>
                    </CloudinaryUploader>
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-slate-50 to-cyan-50 dark:from-slate-900 dark:to-cyan-950 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
              className="border-cyan-200 dark:border-cyan-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600"
            >
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
