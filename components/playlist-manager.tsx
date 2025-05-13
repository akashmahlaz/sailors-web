"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, ListMusic, Plus, Trash2, Edit } from "lucide-react"

interface Playlist {
  id: string
  name: string
  description: string
  audio_ids: string[]
  created_at: string
  updated_at: string
}

interface Audio {
  id: string
  title: string
  thumbnail_url?: string
}

interface PlaylistManagerProps {
  audios: Audio[]
  onPlaylistSelect: (playlist: Playlist) => void
  currentPlaylistId?: string
}

export default function PlaylistManager({ audios, onPlaylistSelect, currentPlaylistId }: PlaylistManagerProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("")
  const [selectedAudios, setSelectedAudios] = useState<string[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentEditPlaylist, setCurrentEditPlaylist] = useState<Playlist | null>(null)

  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/playlists")

      if (!response.ok) {
        throw new Error(`Failed to fetch playlists: ${response.statusText}`)
      }

      const data = await response.json()
      setPlaylists(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching playlists:", err)
      setError(err instanceof Error ? err.message : "Failed to load playlists")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      return
    }

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newPlaylistName,
          description: newPlaylistDescription,
          audioIds: selectedAudios,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create playlist")
      }

      // Reset form
      setNewPlaylistName("")
      setNewPlaylistDescription("")
      setSelectedAudios([])
      setCreateDialogOpen(false)

      // Refresh playlists
      fetchPlaylists()
    } catch (err) {
      console.error("Error creating playlist:", err)
      setError(err instanceof Error ? err.message : "Failed to create playlist")
    }
  }

  const updatePlaylist = async () => {
    if (!currentEditPlaylist || !currentEditPlaylist.name.trim()) {
      return
    }

    try {
      const response = await fetch(`/api/playlists/${currentEditPlaylist.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: currentEditPlaylist.name,
          description: currentEditPlaylist.description,
          audioIds: selectedAudios,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update playlist")
      }

      // Reset form
      setCurrentEditPlaylist(null)
      setSelectedAudios([])
      setEditDialogOpen(false)

      // Refresh playlists
      fetchPlaylists()
    } catch (err) {
      console.error("Error updating playlist:", err)
      setError(err instanceof Error ? err.message : "Failed to update playlist")
    }
  }

  const deletePlaylist = async (id: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) {
      return
    }

    try {
      const response = await fetch(`/api/playlists/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete playlist")
      }

      // Refresh playlists
      fetchPlaylists()
    } catch (err) {
      console.error("Error deleting playlist:", err)
      setError(err instanceof Error ? err.message : "Failed to delete playlist")
    }
  }

  const handleEditPlaylist = (playlist: Playlist) => {
    setCurrentEditPlaylist(playlist)
    setSelectedAudios(playlist.audio_ids)
    setEditDialogOpen(true)
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Playlists</CardTitle>
          <CardDescription>Create and manage your playlists</CardDescription>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogDescription>Enter a name and select audio files for your playlist.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="playlist-name" className="text-sm font-medium">
                  Playlist Name
                </label>
                <Input
                  id="playlist-name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="playlist-description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  id="playlist-description"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="A collection of my favorite tracks"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Audio Files</label>
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  <div className="space-y-2">
                    {audios.map((audio) => (
                      <div key={audio.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`audio-${audio.id}`}
                          checked={selectedAudios.includes(audio.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAudios([...selectedAudios, audio.id])
                            } else {
                              setSelectedAudios(selectedAudios.filter((id) => id !== audio.id))
                            }
                          }}
                        />
                        <label
                          htmlFor={`audio-${audio.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {audio.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createPlaylist}>Create Playlist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Playlist</DialogTitle>
              <DialogDescription>Update your playlist details and tracks.</DialogDescription>
            </DialogHeader>
            {currentEditPlaylist && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="edit-playlist-name" className="text-sm font-medium">
                    Playlist Name
                  </label>
                  <Input
                    id="edit-playlist-name"
                    value={currentEditPlaylist.name}
                    onChange={(e) => setCurrentEditPlaylist({ ...currentEditPlaylist, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-playlist-description" className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id="edit-playlist-description"
                    value={currentEditPlaylist.description}
                    onChange={(e) => setCurrentEditPlaylist({ ...currentEditPlaylist, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Audio Files</label>
                  <ScrollArea className="h-[200px] border rounded-md p-2">
                    <div className="space-y-2">
                      {audios.map((audio) => (
                        <div key={audio.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-audio-${audio.id}`}
                            checked={selectedAudios.includes(audio.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAudios([...selectedAudios, audio.id])
                              } else {
                                setSelectedAudios(selectedAudios.filter((id) => id !== audio.id))
                              }
                            }}
                          />
                          <label
                            htmlFor={`edit-audio-${audio.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {audio.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updatePlaylist}>Update Playlist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading playlists</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading playlists...</div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No playlists yet. Create your first playlist!</div>
        ) : (
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`p-3 rounded-md flex items-center gap-3 cursor-pointer hover:bg-muted transition-colors ${
                  currentPlaylistId === playlist.id ? "bg-muted" : ""
                }`}
                onClick={() => onPlaylistSelect(playlist)}
              >
                <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                  <ListMusic className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{playlist.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {playlist.audio_ids.length} tracks • Created {new Date(playlist.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditPlaylist(playlist)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      deletePlaylist(playlist.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
