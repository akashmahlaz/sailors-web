"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Edit, FileText } from "lucide-react"

interface Profile {
  userId: string
  name: string
  email?: string
  image?: string
  profileImage?: string
  coverImage?: string
  bio: string
  location: string
  website: string
  joinedAt: string
  role: string
  interests: string[]
  expertise: string[]
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("about")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (params.id) {
      fetchProfile(params.id)
    }
  }, [params.id])

  const fetchProfile = async (profileId: string) => {
    try {
      setLoading(true)
      setError(null)

      // First try to fetch from /api/users/[id]
      const response = await fetch(`/api/users/${profileId}`)
      if (!response.ok) {
        // If not found by ID, try fetching from the users list
        const usersRes = await fetch("/api/users")
        if (!usersRes.ok) throw new Error("Failed to fetch profile")
        const users = await usersRes.json()
        const profileData = users.find((u: any) => u._id === profileId)
        if (!profileData) throw new Error("Profile not found")
        setProfile(profileData)
      } else {
        const data = await response.json()
        console.log('Profile data:', data)
        setProfile(data)
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Failed to load profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Get the profile image from either uploaded image or session
  const getProfileImage = () => {
    if (profile?.profileImage) return profile.profileImage
    if (profile?.image) return profile.image
    if (session?.user?.image) return session.user.image
    return "/placeholder.svg"
  }

  console.log('Session:', session)
  console.log('Profile:', profile)
  console.log('Is own profile:', session?.user?.id === profile?.userId)

  if (status === "loading" || loading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Profile not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const isOwnProfile = session?.user?.id === profile.userId
  const username = profile.email ? `@${profile.email.split('@')[0]}` : ''

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Cover Image */}
      {profile.coverImage && (
        <div className="h-48 md:h-64 w-full relative">
          <img
            src={profile.coverImage}
            alt={`${profile.name}'s cover`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
              <Avatar className="w-full h-full">
                <AvatarImage src={getProfileImage()} alt={profile.name} />
                <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
                  {username && <p className="text-slate-600 dark:text-slate-400">{username}</p>}
                </div>
                {isOwnProfile && (
                  <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-slate-200 dark:border-slate-700 w-full md:w-auto"
                      onClick={() => router.push("/profile/edit")}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit Profile</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-slate-200 dark:border-slate-700 w-full md:w-auto"
                      onClick={() => router.push("/content-management")}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Manage Content</span>
                      <span className="sm:hidden">Content</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Bio */}
              <p className="mt-4 text-slate-600 dark:text-slate-400">{profile.bio || "No bio yet"}</p>

              {/* Profile Stats */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span>Joined {formatDistanceToNow(new Date(profile.joinedAt), { addSuffix: true })}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="about" className="whitespace-nowrap">About</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="about" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>About {profile.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Bio</h3>
                  <p className="text-slate-900 dark:text-slate-100 break-words">{profile.bio || "No bio provided"}</p>
                </div>

                {profile.location && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Location</h3>
                    <p className="text-slate-900 dark:text-slate-100 break-words">{profile.location}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Joined</h3>
                  <p className="text-slate-900 dark:text-slate-100">
                    {formatDistanceToNow(new Date(profile.joinedAt), { addSuffix: true })}
                  </p>
                </div>

                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest: string) => (
                        <Badge key={interest} variant="outline" className="whitespace-nowrap">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.expertise && profile.expertise.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.expertise.map((skill: string) => (
                        <Badge key={skill} variant="outline" className="whitespace-nowrap">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="h-48 md:h-64 w-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="container px-4 relative">
        <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    </div>
  )
}
