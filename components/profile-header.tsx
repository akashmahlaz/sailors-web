"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Anchor, Edit, MapPin, Ship, Users } from "lucide-react"
import Link from "next/link"

interface ProfileHeaderProps {
  profile: any
  isOwnProfile: boolean
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  activeTab = "content",
  onTabChange,
}: ProfileHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(profile.followers?.length || 0)
  const [followingCount, setFollowingCount] = useState(profile.following?.length || 0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOwnProfile && session?.user?.id) {
      checkFollowStatus()
    }
  }, [session, profile.userId])

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/users/${profile.userId}/follow`)
      const data = await response.json()
      setIsFollowing(data.following)
    } catch (error) {
      console.error("Error checking follow status:", error)
    }
  }

  const handleFollow = async () => {
    if (!session?.user) {
      router.push("/signin")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${profile.userId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1))
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value)
    }
  }

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-48 md:h-64 w-full bg-gradient-to-r from-gray-500 to-slate-700 relative overflow-hidden">
        {profile.coverImage && (
          <img
            src={profile.coverImage || "/placeholder.svg"}
            alt={`${profile.name}'s cover`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="container px-4 relative">
        <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-900 shadow-lg">
              <AvatarImage src={profile.profileImage || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="text-3xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-0 md:mt-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {profile.name}
                  {profile.role === "admin" && (
                    <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                      <Ship className="h-3 w-3 mr-1" />
                      Captain
                    </Badge>
                  )}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <Link
                      href={`/profile/${profile.userId}/followers`}
                      className="hover:text-slate-600 dark:hover:text-slate-400"
                    >
                      <span className="font-medium text-slate-900 dark:text-slate-100">{followerCount}</span> Followers
                    </Link>
                  </div>

                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <Link
                      href={`/profile/${profile.userId}/following`}
                      className="hover:text-slate-600 dark:hover:text-slate-400"
                    >
                      <span className="font-medium text-slate-900 dark:text-slate-100">{followingCount}</span> Following
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button
                    onClick={() => router.push("/profile/edit")}
                    variant="outline"
                    className="border-slate-200 dark:border-slate-900"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    onClick={handleFollow}
                    disabled={isLoading}
                    variant={isFollowing ? "outline" : "default"}
                    className={
                      isFollowing
                        ? "border-slate-200 dark:border-slate-900"
                        : "bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                    }
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>
            </div>

            {profile.bio && <p className="mt-4 text-slate-700 dark:text-slate-300">{profile.bio}</p>}

            {profile.socialLinks && Object.values(profile.socialLinks).some((link) => !!link) && (
              <div className="mt-4 flex flex-wrap gap-3">
                {profile.socialLinks.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1"
                  >
                    <Anchor className="h-4 w-4" />
                    Website
                  </a>
                )}
                {/* Add other social links here */}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-slate-200 dark:border-slate-800">
          <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
            <TabsList className="bg-transparent h-12">
              <TabsTrigger
                value="content"
                className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-900"
              >
                Content
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-900"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="followers"
                className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-900"
              >
                Followers
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-900"
              >
                Following
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
