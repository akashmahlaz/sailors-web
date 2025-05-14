"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import ProfileHeader from "@/components/profile-header"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("content")
  const [userContent, setUserContent] = useState<any>({
    videos: [],
    photos: [],
    audio: [],
    blogs: [],
    podcasts: [],
    news: [],
  })
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])

  // Determine if viewing own profile
  const isOwnProfile = session?.user?.id === params.id || (params.id === "me" && !!session?.user)
  const profileId = params.id === "me" ? session?.user?.id : params.id

  useEffect(() => {
    // Only fetch once we have session resolved and profileId
    if (status === "loading" || (params.id === "me" && status !== "authenticated")) {
      return
    }

    if (!profileId) {
      if (params.id === "me") {
        // If trying to view own profile but not logged in
        router.push("/signin?callbackUrl=/profile/me")
        return
      }
      setError("Profile ID not found")
      setLoading(false)
      return
    }

    fetchProfile()
  }, [status, profileId, params.id])

  const fetchProfile = async () => {
    try {
      setLoading(true)

      // For own profile, use session data as a starting point
      if (isOwnProfile && session?.user) {
        setProfile({
          userId: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          // Add default values for other fields
          bio: "",
          location: "",
          interests: [],
          expertise: [],
          profileImage: session.user.image,
          coverImage: "",
          joinedAt: new Date().toISOString(),
          followers: [],
          following: [],
          role: session.user.role || "user",
        })
      }

      // Fetch full profile data from API
      const response = await fetch(`/api/users/${profileId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()
      setProfile(data)

      // If we get profile data, proceed to fetch content based on active tab
      if (activeTab === "content") {
        fetchUserContent(profileId)
      } else if (activeTab === "followers") {
        fetchFollowers(profileId)
      } else if (activeTab === "following") {
        fetchFollowing(profileId)
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading && profile) {
      if (activeTab === "content") {
        fetchUserContent(profileId)
      } else if (activeTab === "followers") {
        fetchFollowers(profileId)
      } else if (activeTab === "following") {
        fetchFollowing(profileId)
      }
    }
  }, [activeTab, loading, profile])

  const fetchUserContent = async (userId: string) => {
    try {
      // Fetch videos
      const videosResponse = await fetch(`/api/videos?userId=${userId}`)
      const videos = await videosResponse.json()

      // Fetch photos
      const photosResponse = await fetch(`/api/photos?userId=${userId}`)
      const photos = await photosResponse.json()

      // Fetch audio
      const audioResponse = await fetch(`/api/audio?userId=${userId}`)
      const audio = await audioResponse.json()

      // Fetch blogs
      const blogsResponse = await fetch(`/api/blogs?userId=${userId}`)
      const blogs = await blogsResponse.json()

      // Fetch podcasts
      const podcastsResponse = await fetch(`/api/podcasts?userId=${userId}`)
      const podcasts = await podcastsResponse.json()

      // Fetch news
      const newsResponse = await fetch(`/api/news?userId=${userId}`)
      const news = await newsResponse.json()

      setUserContent({
        videos: videos.videos || videos || [],
        photos: photos.photos || photos || [],
        audio: audio.audio || audio || [],
        blogs: blogs.blogs || blogs || [],
        podcasts: podcasts.podcasts || podcasts || [],
        news: news.news || news || [],
      })
    } catch (err) {
      console.error("Error fetching user content:", err)
    }
  }

  const fetchFollowers = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/followers`)

      if (!response.ok) {
        throw new Error("Failed to fetch followers")
      }

      const data = await response.json()
      setFollowers(data.followers || data || [])
    } catch (err) {
      console.error("Error fetching followers:", err)
    }
  }

  const fetchFollowing = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/following`)

      if (!response.ok) {
        throw new Error("Failed to fetch following")
      }

      const data = await response.json()
      setFollowing(data.following || data || [])
    } catch (err) {
      console.error("Error fetching following:", err)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  if (status === "loading" || (params.id === "me" && status !== "authenticated")) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  if (loading && !profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-cyan-50 dark:from-slate-950 dark:to-cyan-950">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="container px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsContent value="content" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderContentSection("Videos", userContent.videos)}
              {renderContentSection("Photos", userContent.photos)}
              {renderContentSection("Audio", userContent.audio)}
              {renderContentSection("Blog Posts", userContent.blogs)}
              {renderContentSection("Podcasts", userContent.podcasts)}
              {renderContentSection("News Articles", userContent.news)}
            </div>

            {Object.values(userContent).every((content: any) => content.length === 0) && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No content yet</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {isOwnProfile
                    ? "You haven't uploaded any content yet. Start sharing your voyage!"
                    : `${profile.name} hasn't uploaded any content yet.`}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-cyan-900 dark:text-cyan-100">About {profile.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Bio</h3>
                  <p className="text-slate-900 dark:text-slate-100">{profile.bio || "No bio provided"}</p>
                </div>

                {profile.location && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Location</h3>
                    <p className="text-slate-900 dark:text-slate-100">{profile.location}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Joined</h3>
                  <p className="text-slate-900 dark:text-slate-100">
                    {new Date(profile.joinedAt || new Date()).toLocaleDateString()}
                  </p>
                </div>

                {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest: string) => (
                        <Badge key={interest} variant="outline">
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
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followers" className="mt-0">
            <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-cyan-900 dark:text-cyan-100">Followers</CardTitle>
                <CardDescription>People following {profile.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {followers.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-slate-500 dark:text-slate-400">No followers yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {followers.map((follower) => (
                      <div
                        key={follower._id || follower.id || Math.random().toString(36).substr(2, 9)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-cyan-100 dark:border-cyan-900 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                        onClick={() => router.push(`/profile/${follower.userId || follower._id}`)}
                        role="button"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              follower.profileImage ||
                              follower.image ||
                              "/placeholder.svg?height=40&width=40&query=profile"
                            }
                            alt={follower.name}
                          />
                          <AvatarFallback>{follower.name?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{follower.name}</p>
                          {follower.location && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">{follower.location}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="following" className="mt-0">
            <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-cyan-900 dark:text-cyan-100">Following</CardTitle>
                <CardDescription>People {profile.name} follows</CardDescription>
              </CardHeader>
              <CardContent>
                {following.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-slate-500 dark:text-slate-400">Not following anyone yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {following.map((followedUser) => (
                      <div
                        key={followedUser._id || followedUser.id || Math.random().toString(36).substr(2, 9)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-cyan-100 dark:border-cyan-900 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                        onClick={() => router.push(`/profile/${followedUser.userId || followedUser._id}`)}
                        role="button"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={
                              followedUser.profileImage ||
                              followedUser.image ||
                              "/placeholder.svg?height=40&width=40&query=profile"
                            }
                            alt={followedUser.name}
                          />
                          <AvatarFallback>{followedUser.name?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{followedUser.name}</p>
                          {followedUser.location && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">{followedUser.location}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  function renderContentSection(title: string, items: any[]) {
    if (!items || items.length === 0) return null

    return (
      <Card className="border-cyan-200 shadow-md dark:border-cyan-900 dark:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-cyan-900 dark:text-cyan-100">{title}</CardTitle>
          <CardDescription>
            {items.length} item{items.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {items.slice(0, 4).map((item) => (
              <div
                key={item._id || item.id || Math.random().toString(36).substr(2, 9)}
                className="aspect-square rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden"
                onClick={() => {
                  const contentType = title.toLowerCase().replace(" ", "")
                  const contentId = item._id || item.id
                  router.push(`/${contentType}/${contentId}`)
                }}
                role="button"
              >
                {item.thumbnailUrl || item.coverImage || item.thumbnail_url || item.url ? (
                  <img
                    src={item.thumbnailUrl || item.coverImage || item.thumbnail_url || item.url || "/placeholder.svg"}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center p-2 text-center text-xs text-slate-500 dark:text-slate-400">
                    {item.title || "Untitled"}
                  </div>
                )}
              </div>
            ))}
          </div>

          {items.length > 4 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer">
                View all {items.length} {title.toLowerCase()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
}
