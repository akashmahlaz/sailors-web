"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  Users,
  Video,
  Music,
  ImageIcon,
  FileText,
  BarChart3,
  TrendingUp,
  Activity,
  Calendar,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface AnalyticsData {
  totalUsers: number
  totalVideos: number
  totalPhotos: number
  totalPlaylists: number
  contentGrowth: {
    date: string
    videos: number
    photos: number
    playlists: number
  }[]
  contentDistribution: {
    name: string
    value: number
    color: string
  }[]
  userActivity: {
    date: string
    signups: number
    uploads: number
  }[]
  popularContent: {
    id: string
    title: string
    type: string
    views: number
    likes: number
    comments: number
  }[]
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState("30days")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  // Fetch analytics data
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return

    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.statusText}`)
        }

        const data = await response.json()
        setAnalyticsData(data)
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange, session, status])

  if (status === "loading") {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (status === "authenticated" && session?.user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Loading analytics...</h1>
        </div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Failed to load analytics data"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/admin/content">
            <Button>Manage Content</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={analyticsData.totalUsers}
          icon={<Users className="h-5 w-5" />}
          trend="+12%"
          color="blue"
        />
        <StatCard
          title="Total Videos"
          value={analyticsData.totalVideos}
          icon={<Video className="h-5 w-5" />}
          trend="+8%"
          color="indigo"
        />
        <StatCard
          title="Total Photos"
          value={analyticsData.totalPhotos}
          icon={<ImageIcon className="h-5 w-5" />}
          trend="+15%"
          color="amber"
        />
        <StatCard
          title="Total Playlists"
          value={analyticsData.totalPlaylists}
          icon={<Music className="h-5 w-5" />}
          trend="+5%"
          color="purple"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Growth</CardTitle>
                <CardDescription>Content creation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.contentGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="videos" stroke="#3b82f6" />
                      <Line type="monotone" dataKey="photos" stroke="#f59e0b" />
                      <Line type="monotone" dataKey="playlists" stroke="#8b5cf6" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
                <CardDescription>Types of content on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.contentDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analyticsData.contentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>User signups and content uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="signups" fill="#3b82f6" />
                    <Bar dataKey="uploads" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Content</CardTitle>
              <CardDescription>Most viewed content on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.popularContent.map((content) => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{content.title}</h3>
                      <p className="text-sm text-muted-foreground">{content.type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-medium">{content.views}</span> views
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{content.likes}</span> likes
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{content.comments}</span> comments
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend: string
  color: string
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
    green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
    red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-100" },
  }

  const { bg, text, border } = colorMap[color] || colorMap.blue

  return (
    <Card className={`${bg} ${border} dark:bg-slate-800 dark:border-slate-700`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${text} dark:text-slate-300`}>{title}</span>
          {icon}
        </div>
        <div className="text-2xl font-bold mb-1">{value.toLocaleString()}</div>
        <div className="text-xs text-green-600 dark:text-green-400">{trend}</div>
      </CardContent>
    </Card>
  )
}

function LifeBuoy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="14.83" y1="9.17" x2="18.36" y2="5.64" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  )
}
