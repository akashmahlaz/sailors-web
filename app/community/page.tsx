"use client"

import Link from "next/link"
import { useState } from "react"
import { Users, Anchor, Sparkles, UserPlus, Users as UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Dialog as GroupDialog, DialogContent as GroupDialogContent, DialogHeader as GroupDialogHeader, DialogTitle as GroupDialogTitle, DialogFooter as GroupDialogFooter } from "@/components/ui/dialog"

const mockPosts = [
  {
    id: 1,
    author: {
      name: "Captain Morgan",
      avatar: "/placeholder-user.jpg",
      role: "Captain",
    },
    date: "2025-05-13",
    title: "Best routes for monsoon season?",
    content: "What are your favorite safe routes during the monsoon? Any tips for new sailors?",
    tags: ["Q&A", "Navigation"],
    comments: 3,
    upvotes: 12,
  },
  {
    id: 2,
    author: {
      name: "Sailor Jane",
      avatar: "/d0.jpg",
      role: "Navigator",
    },
    date: "2025-05-12",
    title: "Photo: Sunrise at Sea",
    content: "Captured this beautiful sunrise on my last voyage!",
    tags: ["Photos", "Experience"],
    comments: 1,
    upvotes: 8,
  },
]

const mockGroups = [
  { id: 1, name: "Ocean Adventurers", description: "For those who love long voyages.", members: 23, avatar: "/placeholder-logo.svg", admin: "Captain Morgan" },
  { id: 2, name: "Photo Sailors", description: "Share your best sea photos!", members: 15, avatar: "/placeholder-logo.svg", admin: "Sailor Jane" },
]

const mockUser = {
  name: "You",
  avatar: "/placeholder-user.jpg",
  role: "Member",
}

export default function CommunityPage() {
  const [search, setSearch] = useState("")
  const [posts, setPosts] = useState(mockPosts)
  const [newPost, setNewPost] = useState({ title: "", content: "" })
  const [groups, setGroups] = useState(mockGroups)
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: "", description: "" })
  const [joinedGroups, setJoinedGroups] = useState<number[]>([])
  const [groupDetail, setGroupDetail] = useState<null | typeof mockGroups[0]>(null)
  const [groupPosts, setGroupPosts] = useState<{ [groupId: number]: typeof mockPosts }>(() => {
    const initial: { [groupId: number]: typeof mockPosts } = {}
    groups.forEach(g => { initial[g.id] = [] })
    return initial
  })
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null)
  const [newGroupPost, setNewGroupPost] = useState({ title: "", content: "" })

  const handlePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return
    setPosts([
      {
        id: Date.now(),
        author: {
          name: "You",
          avatar: "/placeholder-user.jpg",
          role: "Member",
        },
        date: new Date().toISOString().slice(0, 10),
        title: newPost.title,
        content: newPost.content,
        tags: ["General"],
        comments: 0,
        upvotes: 0,
      },
      ...posts,
    ])
    setNewPost({ title: "", content: "" })
  }

  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) return
    setGroups([
      ...groups,
      {
        id: Date.now(),
        name: newGroup.name,
        description: newGroup.description,
        members: 1,
        avatar: "/placeholder-logo.svg",
        admin: "You",
      },
    ])
    setNewGroup({ name: "", description: "" })
    setGroupDialogOpen(false)
  }

  const handleJoinGroup = (groupId: number) => {
    if (!joinedGroups.includes(groupId)) {
      setJoinedGroups([...joinedGroups, groupId])
      setGroups(groups.map(g => g.id === groupId ? { ...g, members: g.members + 1 } : g))
    }
  }

  const handleLeaveGroup = (groupId: number) => {
    setJoinedGroups(joinedGroups.filter(id => id !== groupId))
    setGroups(groups.map(g => g.id === groupId ? { ...g, members: Math.max(1, g.members - 1) } : g))
  }

  const handleGroupPost = () => {
    if (!activeGroupId || !newGroupPost.title.trim() || !newGroupPost.content.trim()) return
    setGroupPosts(prev => ({
      ...prev,
      [activeGroupId]: [
        {
          id: Date.now(),
          author: mockUser,
          date: new Date().toISOString().slice(0, 10),
          title: newGroupPost.title,
          content: newGroupPost.content,
          tags: ["General"],
          comments: 0,
          upvotes: 0,
        },
        ...(prev[activeGroupId] || [])
      ]
    }))
    setNewGroupPost({ title: "", content: "" })
  }

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="max-w-2xl w-full text-center py-10">
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium text-sm">
            <Sparkles className="w-4 h-4 mr-1" /> Community
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 dark:text-white">
          Welcome to the Sailors Community
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6">
          Connect with fellow sailors, share your stories, ask questions, and explore the vibrant maritime community.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link href="/signup">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              Join the Community <Users className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/support">
            <Button size="lg" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
              Need Help? <Anchor className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-50"
            onClick={() => setGroupDialogOpen(true)}
          >
            + Create Group
          </Button>
        </div>
        {/* Groups List */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Groups</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {groups.map(group => (
              <div key={group.id} className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 text-left flex items-center gap-4 ${activeGroupId === group.id ? 'ring-2 ring-green-400' : ''}`}>
                <img src={group.avatar || "/placeholder-logo.svg"} alt={group.name} className="h-12 w-12 rounded-full object-cover border border-green-200 dark:border-green-700 cursor-pointer" onClick={() => setActiveGroupId(group.id)} />
                <div className="flex-1 cursor-pointer" onClick={() => setActiveGroupId(group.id)}>
                  <div className="font-bold text-green-800 dark:text-green-200 flex items-center gap-2">{group.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{group.description}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <UsersIcon className="h-4 w-4 mr-1" /> {group.members} members
                  </div>
                </div>
                {joinedGroups.includes(group.id) ? (
                  <Button size="sm" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50" onClick={() => handleLeaveGroup(group.id)}>
                    Leave
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50" onClick={() => handleJoinGroup(group.id)}>
                    <UserPlus className="h-4 w-4 mr-1" /> Join
                  </Button>
                )}
              </div>
            ))}
          </div>
          {/* Group-specific post form and posts */}
          {activeGroupId && joinedGroups.includes(activeGroupId) && (
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-left">
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Post in {groups.find(g => g.id === activeGroupId)?.name}</h2>
              <Input
                placeholder="Title"
                value={newGroupPost.title}
                onChange={e => setNewGroupPost({ ...newGroupPost, title: e.target.value })}
                className="mb-2"
              />
              <Textarea
                placeholder="Share your story, question, or experience..."
                value={newGroupPost.content}
                onChange={e => setNewGroupPost({ ...newGroupPost, content: e.target.value })}
                className="mb-2"
              />
              <Button onClick={handleGroupPost} className="bg-green-600 hover:bg-green-700 text-white w-full mb-4">Post</Button>
              <div className="space-y-6">
                {(groupPosts[activeGroupId] || []).length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400">No posts in this group yet.</div>
                ) : (
                  groupPosts[activeGroupId].map(post => (
                    <div key={post.id} className="bg-green-50 dark:bg-green-900 rounded-xl shadow p-4 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-green-900 dark:text-green-200 flex items-center gap-2">
                            {post.author.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{post.date}</div>
                        </div>
                      </div>
                      <div className="mb-2">
                        <h3 className="text-base font-bold text-green-900 dark:text-green-100">{post.title}</h3>
                        <p className="text-green-800 dark:text-green-200 mt-1">{post.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {/* Search and New Post */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex-1" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Create a Post</h2>
          <Input
            placeholder="Title"
            value={newPost.title}
            onChange={e => setNewPost({ ...newPost, title: e.target.value })}
            className="mb-2"
          />
          <Textarea
            placeholder="Share your story, question, or experience..."
            value={newPost.content}
            onChange={e => setNewPost({ ...newPost, content: e.target.value })}
            className="mb-2"
          />
          <Button onClick={handlePost} className="bg-green-600 hover:bg-green-700 text-white w-full">Post</Button>
        </div>
        {/* Posts List */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No posts found.</div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      {post.author.name}
                      <Badge variant="outline" className="text-xs border-green-200 text-green-700 dark:border-green-700 dark:text-green-300">
                        {post.author.role}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{post.date}</div>
                  </div>
                </div>
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{post.title}</h3>
                  <p className="text-gray-700 dark:text-gray-200 mt-1">{post.content}</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>💬 {post.comments} comments</span>
                  <span>⬆️ {post.upvotes} upvotes</span>
                </div>
              </div>
            ))
          )}
        </div>
        <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Group</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Group name"
              value={newGroup.name}
              onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
              className="mb-2"
            />
            <Textarea
              placeholder="Group description (optional)"
              value={newGroup.description}
              onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
              className="mb-2"
            />
            <DialogFooter>
              <Button onClick={handleCreateGroup} className="bg-green-600 hover:bg-green-700 text-white w-full">Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Group Detail Modal */}
        <GroupDialog open={!!groupDetail} onOpenChange={() => setGroupDetail(null)}>
          <GroupDialogContent>
            <GroupDialogHeader>
              <GroupDialogTitle>{groupDetail?.name}</GroupDialogTitle>
            </GroupDialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <img src={groupDetail?.avatar || "/placeholder-logo.svg"} alt={groupDetail?.name} className="h-14 w-14 rounded-full object-cover border border-green-200 dark:border-green-700" />
              <div>
                <div className="font-bold text-green-800 dark:text-green-200">{groupDetail?.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{groupDetail?.description}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <UsersIcon className="h-4 w-4 mr-1" /> {groupDetail?.members} members
                </div>
                <div className="text-xs text-green-700 dark:text-green-300 mt-1">Admin: {groupDetail?.admin}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">(Advanced: Group chat, events, and files can be added here.)</div>
            <GroupDialogFooter>
              <Button variant="outline" className="w-full" onClick={() => setGroupDetail(null)}>Close</Button>
            </GroupDialogFooter>
          </GroupDialogContent>
        </GroupDialog>
      </div>
    </div>
  )
}
