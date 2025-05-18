"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Anchor, Edit, MapPin, Ship } from "lucide-react"

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
    <div className="bg-white dark:bg-slate-800 shadow-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Image */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
            <Avatar className="w-full h-full">
              <AvatarImage src={profile.image} alt={profile.name} />
              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
          </div>

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
                </div>
              </div>

              <div className="flex gap-2">
                {isOwnProfile && (
                  <Button
                    onClick={() => router.push("/profile/edit")}
                    variant="outline"
                    className="border-slate-200 dark:border-slate-900"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
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
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
