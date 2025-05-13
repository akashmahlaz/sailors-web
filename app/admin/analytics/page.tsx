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
  totalAudios: number
  totalPhotos: number
  totalBlogs: number
  totalSupportRequests: number
  contentGrowth: {
    date: string
    videos: number
    audios: number
    photos: number
    blogs: number
  }[]
  contentDistribution: {
    name: string
    value: number
    color: string
  }[]
  userActivity: {
    date: string
    signups: number
    logins: number
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

    // For demo purposes, we'll create mock data
    const createMockData = () => {
      const mockData: AnalyticsData = {
        totalUsers: 1247,
        totalVideos: 532,
        totalAudios: 328,
        totalPhotos: 1893,
        totalBlogs: 246,
        totalSupportRequests: 38,
        contentGrowth: Array.from({ length: 12 }, (_, i) => ({
          date: `${i + 1}/2023`,
          videos: Math.floor(Math.random() * 50) + 10,
          audios: Math.floor(Math.random() * 30) + 5,
          photos: Math.floor(Math.random() * 100) + 20,
          blogs: Math.floor(Math.random() * 20) + 5,
        })),
        contentDistribution: [
          { name: "Videos", value: 532, color: "#3b82f6" },
          { name: "Audios", value: 328, color: "#10b981" },
          { name: "Photos", value: 1893, color: "#f59e0b" },
          { name: "Blogs", value: 246, color: "#8b5cf6" },
        ],
        userActivity: Array.from({ length: 30 }, (_, i) => ({
          date: `${i + 1}/5/2023`,
          signups: Math.floor(Math.random() * 15),
          logins: Math.floor(Math.random() * 100) + 50,
          uploads: Math.floor(Math.random() * 40) + 10,
        })),
        popularContent: [
          { id: "1", title: "Sailing the Caribbean", type: "video", views: 12453, likes: 843, comments: 156 },
          { id: "2", title: "Sea Shanty Collection", type: "audio", views: 8932, likes: 721, comments: 89 },
          { id: "3", title: "Sunset at Sea", type: "photo", views: 7821, likes: 1243, comments: 67 },
          { id: "4", title: "Life of a Sailor", type: "blog", views: 6543, likes: 532, comments: 124 },
          { id: "5", title: "Storm Navigation", type: "video", views: 5932, likes: 421, comments: 78 },
        ],
      }
      setAnalyticsData(mockData)
      setLoading(false)
    }

    // Use mock data for now
    createMockData()

    // In a real app, you would fetch actual data
    // fetchAnalytics()
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

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-slate-50 to-cyan-50 dark:from-slate-950 dark:to-cyan-950">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">Platform Analytics</h1>
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
            <Button className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600">
              Manage Content
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-700"></div>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : analyticsData ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <StatCard
              title="Total Users"
              value={analyticsData.totalUsers}
              icon={<Users className="h-5 w-5 text-blue-600" />}
              trend="+12% from last month"
              color="blue"
            />
            <StatCard
              title="Videos"
              value={analyticsData.totalVideos}
              icon={<Video className="h-5 w-5 text-indigo-600" />}
              trend="+8% from last month"
              color="indigo"
            />
            <StatCard
              title="Audio Files"
              value={analyticsData.totalAudios}
              icon={<Music className="h-5 w-5 text-green-600" />}
              trend="+5% from last month"
              color="green"
            />
            <StatCard
              title="Photos"
              value={analyticsData.totalPhotos}
              icon={<ImageIcon className="h-5 w-5 text-amber-600" />}
              trend="+15% from last month"
              color="amber"
            />
            <StatCard
              title="Blog Posts"
              value={analyticsData.totalBlogs}
              icon={<FileText className="h-5 w-5 text-purple-600" />}
              trend="+3% from last month"
              color="purple"
            />
            <StatCard
              title="Support Requests"
              value={analyticsData.totalSupportRequests}
              icon={<LifeBuoy className="h-5 w-5 text-red-600" />}
              trend="-2% from last month"
              color="red"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-600" />
                  Content Growth
                </CardTitle>
                <CardDescription>Monthly content uploads by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.contentGrowth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="videos" stackId="a" fill="#3b82f6" name="Videos" />
                      <Bar dataKey="audios" stackId="a" fill="#10b981" name="Audios" />
                      <Bar dataKey="photos" stackId="a" fill="#f59e0b" name="Photos" />
                      <Bar dataKey="blogs" stackId="a" fill="#8b5cf6" name="Blogs" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-600" />
                  User Activity
                </CardTitle>
                <CardDescription>Daily user engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyticsData.userActivity.slice(-14)} // Show last 14 days
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="signups" stroke="#3b82f6" name="New Users" />
                      <Line type="monotone" dataKey="logins" stroke="#10b981" name="Logins" />
                      <Line type="monotone" dataKey="uploads" stroke="#f59e0b" name="Content Uploads" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-600" />
                  Content Distribution
                </CardTitle>
                <CardDescription>Breakdown of content types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.contentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

            <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-600" />
                  Popular Content
                </CardTitle>
                <CardDescription>Most viewed content across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cyan-100 dark:border-cyan-900">
                        <th className="text-left py-3 px-4 font-medium text-cyan-900 dark:text-cyan-100">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-cyan-900 dark:text-cyan-100">Type</th>
                        <th className="text-right py-3 px-4 font-medium text-cyan-900 dark:text-cyan-100">Views</th>
                        <th className="text-right py-3 px-4 font-medium text-cyan-900 dark:text-cyan-100">Likes</th>
                        <th className="text-right py-3 px-4 font-medium text-cyan-900 dark:text-cyan-100">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.popularContent.map((item) => (
                        <tr key={item.id} className="border-b border-cyan-50 dark:border-cyan-950">
                          <td className="py-3 px-4">{item.title}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="capitalize">
                              {item.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">{item.views.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{item.likes.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">{item.comments.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Performance */}
          <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-cyan-600" />
                Content Performance
              </CardTitle>
              <CardDescription>Detailed metrics by content type</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="videos">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="videos">Videos</TabsTrigger>
                  <TabsTrigger value="audios">Audio</TabsTrigger>
                  <TabsTrigger value="photos">Photos</TabsTrigger>
                  <TabsTrigger value="blogs">Blogs</TabsTrigger>
                </TabsList>
                <TabsContent value="videos">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData.contentGrowth}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="videos" stroke="#3b82f6" name="Videos" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="audios">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData.contentGrowth}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="audios" stroke="#10b981" name="Audios" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="photos">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData.contentGrowth}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="photos" stroke="#f59e0b" name="Photos" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="blogs">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData.contentGrowth}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="blogs" stroke="#8b5cf6" name="Blogs" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      ) : null}
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
