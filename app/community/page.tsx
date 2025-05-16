"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Sparkles, Users, Anchor, ThumbsUp, MessageCircle, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function CommunityPage() {
  const { data: session, status } = useSession();
  const [search, setSearch] = useState("")
  const [posts, setPosts] = useState<any[]>([])
  const [newPost, setNewPost] = useState({ title: "", content: "" })
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  const [upvotedPosts, setUpvotedPosts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null)
  const [commentInput, setCommentInput] = useState("")
  const commentInputRef = useRef<HTMLInputElement>(null)

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-gray-600 border-t-transparent rounded-full mr-2"></div>
        <span>Loading...</span>
      </div>
    );
  }
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-2xl font-bold mb-4">You must be logged in to access the community.</div>
        <Link href="/signin">
          <Button className="bg-gray-600 hover:bg-gray-700 text-white">Sign In</Button>
        </Link>
      </div>
    );
  }

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/posts")
        if (!res.ok) throw new Error("Failed to fetch posts")
        const data = await res.json()
        setPosts(Array.isArray(data) ? data : data.posts || [])
      } catch (err: any) {
        setError(err.message || "Failed to load posts")
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // Create a new post
  const handlePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return
    setLoading(true)
    try {
      // Use session user info if available
      let user = session?.user
      if (!user) {
        const name = prompt('Enter your name for this post:') || 'Anonymous'
        user = { name, image: '/placeholder-user.jpg', role: 'Member' }
      }
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPost, author: user }),
      })
      if (!res.ok) throw new Error("Failed to create post")
      const created = await res.json()
      setPosts([created, ...posts])
      setNewPost({ title: "", content: "" })
    } catch (err: any) {
      setError(err.message || "Failed to create post")
    } finally {
      setLoading(false)
    }
  }

  // Like a post
  const handleLike = async (postId: string) => {
    if (likedPosts.includes(postId)) return
    setLikedPosts([...likedPosts, postId])
    try {
      await fetch(`/api/posts/${postId}/like`, { method: "POST" })
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    } catch {}
  }

  // Upvote a post
  const handleUpvote = async (postId: string) => {
    if (upvotedPosts.includes(postId)) return
    setUpvotedPosts([...upvotedPosts, postId])
    try {
      await fetch(`/api/posts/${postId}/upvote`, { method: "POST" })
      setPosts(posts.map(p => p._id === postId ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p))
    } catch {}
  }

  // Comment on a post (show input below post)
  const handleComment = (postId: string) => {
    setCommentingPostId(postId)
    setCommentInput("")
    setTimeout(() => {
      commentInputRef.current?.focus()
    }, 100)
  }

  const submitComment = async (postId: string) => {
    if (!commentInput.trim()) return
    try {
      // Use session user info if available
      let user = session?.user
      if (!user) {
        const name = prompt('Enter your name for this comment:') || 'Anonymous'
        user = { name, image: '/placeholder-user.jpg' }
      }
      await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentInput, author: user }),
      })
      setPosts(posts.map(p =>
        p._id === postId
          ? { ...p, comments: (p.comments || 0) + 1, commentsList: [...(p.commentsList || []), { content: commentInput, author: user, createdAt: new Date().toISOString() }] }
          : p
      ))
      setCommentInput("")
      setCommentingPostId(null)
    } catch {}
  }

  const filteredPosts = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.content?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="max-w-2xl w-full text-center py-10">
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium text-sm">
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
            <Button size="lg" className="bg-gray-600 hover:bg-gray-700 text-white">
              Join the Community <Users className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/support">
            <Button size="lg" variant="outline" className="border-gray-600 text-gray-700 hover:bg-gray-50">
              Need Help? <Anchor className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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
          <Button onClick={handlePost} className="bg-gray-600 hover:bg-gray-700 text-white w-full" disabled={loading}>Post</Button>
        </div>
        {/* Posts List */}
        <div className="space-y-6">
          {error && <div className="text-red-500 text-center">{error}</div>}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No posts found.</div>
          ) : (
            filteredPosts.map(post => (
              <div key={post._id} className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={post.author?.image || post.author?.avatar || "/placeholder-user.jpg"} />
                    <AvatarFallback>{post.author?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      {post.author?.name || "Unknown"}
                      <Badge variant="outline" className="text-xs border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300">
                        {post.author?.role || "Member"}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{post.date || post.createdAt?.slice(0,10)}</div>
                  </div>
                </div>
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{post.title}</h3>
                  <p className="text-gray-700 dark:text-gray-200 mt-1">{post.content}</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.tags?.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                  <button
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition ${likedPosts.includes(post._id) ? 'text-blue-600 font-semibold' : ''}`}
                    onClick={() => handleLike(post._id)}
                    disabled={likedPosts.includes(post._id)}
                  >
                    <ThumbsUp className="h-4 w-4" /> {post.likes || 0} Like
                  </button>
                  <button
                    className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                    onClick={() => handleComment(post._id)}
                  >
                    <MessageCircle className="h-4 w-4" /> {post.comments || 0} Comment
                  </button>
                  <button
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition ${upvotedPosts.includes(post._id) ? 'text-green-600 font-semibold' : ''}`}
                    onClick={() => handleUpvote(post._id)}
                    disabled={upvotedPosts.includes(post._id)}
                  >
                    <ArrowUp className="h-4 w-4" /> {post.upvotes || 0} Upvote
                  </button>
                </div>
                {/* Inline comment input and comments section */}
                {commentingPostId === post._id && (
                  <>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        ref={commentInputRef}
                        type="text"
                        className="flex-1 rounded border px-2 py-1 text-sm bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        placeholder="Write a comment..."
                        value={commentInput}
                        onChange={e => setCommentInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') submitComment(post._id) }}
                      />
                      <Button size="sm" className="bg-gray-600 hover:bg-gray-700 text-white" onClick={() => submitComment(post._id)}>Comment</Button>
                      <Button size="sm" variant="outline" onClick={() => setCommentingPostId(null)}>Cancel</Button>
                    </div>
                    {post.commentsList && post.commentsList.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mb-2 mt-2">
                        <div className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1">Comments:</div>
                        <ul className="space-y-1">
                          {post.commentsList.map((c: any, idx: number) => (
                            <li key={idx} className="text-xs text-gray-700 dark:text-gray-200 flex gap-2 items-center">
                              <span className="font-semibold">{c.author?.name || "User"}:</span> {c.content}
                              <span className="ml-auto text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
