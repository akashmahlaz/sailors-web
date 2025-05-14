"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Plus, RefreshCw, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Playlist {
  id: string
  title: string
  description: string
  videoIds: string[]
  userId: string
  userName: string
  userImage: string | null
  views: number
  created_at: string
}

export default function PlaylistsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all public playlists
        const publicResponse = await fetch("/api/playlists")
        if (!publicResponse.ok) {
          throw new Error(`Failed to fetch playlists: ${publicResponse.statusText}`)
        }
        const publicData = await publicResponse.json()
        setPlaylists(publicData)

        // Fetch user's playlists if logged in
        if (session?.user?.id) {
          const userResponse = await fetch(`/api/playlists?userId=${session.user.id}`)
          if (!userResponse.ok) {
            throw new Error(`Failed to fetch user playlists: ${userResponse.statusText}`)
          }
          const userData = await userResponse.json()
          setMyPlaylists(userData)
        }
      } catch (err) {
        console.error("Error fetching playlists:", err)
        setError(err instanceof Error ? err.message : "Failed to load playlists")
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [session])

  const handleCreatePlaylist = () => {
    router.push("/playlists/create")
  }

  const renderPlaylists = (items: Playlist[]) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Card className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button variant="outline" className="mt-4" onClick={() => setLoading(true)}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </Card>
      )
    }

    if (items.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            {activeTab === "my" ? "You haven't created any playlists yet." : "No playlists found."}
          </p>
          {activeTab === "my" && (
            <Button onClick={handleCreatePlaylist}>
              <Plus className="mr-2 h-4 w-4" /> Create Playlist
            </Button>
          )}
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((playlist) => (
          <Card
            key={playlist.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/playlists/${playlist.id}`)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-1">{playlist.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {playlist.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-24 rounded-md flex items-center justify-center mb-3">
                <div className="text-muted-foreground">
                  {playlist.videoIds.length} {playlist.videoIds.length === 1 ? "video" : "videos"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={playlist.userImage || undefined} />
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs text-muted-foreground flex-1 min-w-0">
                  <span className="font-medium truncate block">{playlist.userName}</span>
                  <span>{formatDistanceToNow(new Date(playlist.created_at), { addSuffix: true })}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {playlist.views} {playlist.views === 1 ? "view" : "views"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Playlists</h1>
        {session && (
          <Button onClick={handleCreatePlaylist}>
            <Plus className="mr-2 h-4 w-4" /> Create Playlist
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Playlists</TabsTrigger>
          {session && <TabsTrigger value="my">My Playlists</TabsTrigger>}
        </TabsList>
        <TabsContent value="all">{renderPlaylists(playlists)}</TabsContent>
        {session && <TabsContent value="my">{renderPlaylists(myPlaylists)}</TabsContent>}
      </Tabs>
    </div>
  )
}
