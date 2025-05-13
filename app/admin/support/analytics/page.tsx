"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, BarChart3, Calendar, LifeBuoy, PieChart, TrendingUp } from "lucide-react"
import type { SupportRequest } from "@/lib/support-requests"

interface CategoryCount {
  category: string
  count: number
}

interface StatusCount {
  status: string
  count: number
}

interface TimelineData {
  date: string
  count: number
}

export default function SupportAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "year">("30days")

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  // Fetch support requests
  useEffect(() => {
    const fetchSupportRequests = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/support")

        if (!response.ok) {
          throw new Error("Failed to fetch support requests")
        }

        const data = await response.json()
        setSupportRequests(data)
      } catch (err) {
        console.error("Error fetching support requests:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch support requests")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchSupportRequests()
    }
  }, [session, status])

  // Filter requests by time range
  const getFilteredRequests = () => {
    const now = new Date()
    let cutoffDate: Date

    switch (timeRange) {
      case "7days":
        cutoffDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "30days":
        cutoffDate = new Date(now.setDate(now.getDate() - 30))
        break
      case "90days":
        cutoffDate = new Date(now.setDate(now.getDate() - 90))
        break
      case "year":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        cutoffDate = new Date(now.setDate(now.getDate() - 30))
    }

    return supportRequests.filter((request) => new Date(request.createdAt) >= cutoffDate)
  }

  // Calculate analytics data
  const calculateAnalytics = () => {
    const filteredRequests = getFilteredRequests()

    // Category distribution
    const categoryMap = new Map<string, number>()
    filteredRequests.forEach((request) => {
      const category = request.category || "uncategorized"
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    const categoryData: CategoryCount[] = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }))

    // Status distribution
    const statusMap = new Map<string, number>()
    filteredRequests.forEach((request) => {
      statusMap.set(request.status, (statusMap.get(request.status) || 0) + 1)
    })

    const statusData: StatusCount[] = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }))

    // Timeline data
    const timelineMap = new Map<string, number>()

    // Initialize all dates in the range
    const dateFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" })
    const now = new Date()
    let days = 30

    switch (timeRange) {
      case "7days":
        days = 7
        break
      case "30days":
        days = 30
        break
      case "90days":
        days = 90
        break
      case "year":
        days = 365
        break
    }

    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = dateFormat.format(date)
      timelineMap.set(dateStr, 0)
    }

    // Fill in actual data
    filteredRequests.forEach((request) => {
      const date = new Date(request.createdAt)
      const dateStr = dateFormat.format(date)
      if (timelineMap.has(dateStr)) {
        timelineMap.set(dateStr, (timelineMap.get(dateStr) || 0) + 1)
      }
    })

    const timelineData: TimelineData[] = Array.from(timelineMap.entries()).map(([date, count]) => ({
      date,
      count,
    }))

    // Resolution time
    const resolvedRequests = filteredRequests.filter((request) => request.status === "resolved" && request.updatedAt)

    let totalResolutionTime = 0
    resolvedRequests.forEach((request) => {
      const createdDate = new Date(request.createdAt)
      const updatedDate = new Date(request.updatedAt!)
      const resolutionTime = (updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60) // in hours
      totalResolutionTime += resolutionTime
    })

    const averageResolutionTime = resolvedRequests.length
      ? (totalResolutionTime / resolvedRequests.length).toFixed(1)
      : "N/A"

    // Anonymous vs. Identified
    const anonymousCount = filteredRequests.filter((request) => request.isAnonymous).length
    const identifiedCount = filteredRequests.filter((request) => !request.isAnonymous).length

    return {
      totalRequests: filteredRequests.length,
      categoryData,
      statusData,
      timelineData,
      averageResolutionTime,
      anonymousCount,
      identifiedCount,
      resolvedCount: resolvedRequests.length,
    }
  }

  const analytics = calculateAnalytics()

  // Format percentage
  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return "0%"
    return `${Math.round((value / total) * 100)}%`
  }

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading support analytics...</p>
      </div>
    )
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
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-cyan-700 dark:text-cyan-300" />
            Support Request Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Insights and trends from sailor support requests</p>
        </div>

        <div>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[180px] border-cyan-200 dark:border-cyan-900">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">{analytics.totalRequests}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Resolved:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {analytics.resolvedCount} ({formatPercentage(analytics.resolvedCount, analytics.totalRequests)})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Average Resolution Time</CardDescription>
            <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">
              {analytics.averageResolutionTime}
              {analytics.averageResolutionTime !== "N/A" && <span className="text-lg ml-1">hours</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Based on {analytics.resolvedCount} resolved requests
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Anonymous vs. Identified</CardDescription>
            <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">
              {formatPercentage(analytics.anonymousCount, analytics.totalRequests)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Anonymous:</span>
                <span>{analytics.anonymousCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Identified:</span>
                <span>{analytics.identifiedCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="pb-2">
            <CardDescription>Top Issue Category</CardDescription>
            <CardTitle className="text-3xl text-cyan-900 dark:text-cyan-100">
              {analytics.categoryData.length > 0
                ? analytics.categoryData.sort((a, b) => b.count - a.count)[0].category
                : "N/A"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {analytics.categoryData.length > 0 && (
                <div className="flex justify-between">
                  <span>Count:</span>
                  <span>
                    {analytics.categoryData.sort((a, b) => b.count - a.count)[0].count} (
                    {formatPercentage(
                      analytics.categoryData.sort((a, b) => b.count - a.count)[0].count,
                      analytics.totalRequests,
                    )}
                    )
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="border-b border-cyan-100 dark:border-cyan-900">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <CardTitle className="text-cyan-900 dark:text-cyan-100">Category Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {analytics.categoryData.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                No data available for the selected time period
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.categoryData
                  .sort((a, b) => b.count - a.count)
                  .map((item) => (
                    <div key={item.category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{item.category}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {item.count} ({formatPercentage(item.count, analytics.totalRequests)})
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div
                          className="bg-cyan-600 dark:bg-cyan-400 h-2.5 rounded-full"
                          style={{ width: `${(item.count / analytics.totalRequests) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
          <CardHeader className="border-b border-cyan-100 dark:border-cyan-900">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <CardTitle className="text-cyan-900 dark:text-cyan-100">Status Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {analytics.statusData.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                No data available for the selected time period
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.statusData
                  .sort((a, b) => b.count - a.count)
                  .map((item) => (
                    <div key={item.status}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{item.status.replace("-", " ")}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {item.count} ({formatPercentage(item.count, analytics.totalRequests)})
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            item.status === "resolved"
                              ? "bg-green-600 dark:bg-green-400"
                              : item.status === "pending"
                                ? "bg-amber-600 dark:bg-amber-400"
                                : item.status === "in-review"
                                  ? "bg-blue-600 dark:bg-blue-400"
                                  : "bg-slate-600 dark:bg-slate-400"
                          }`}
                          style={{ width: `${(item.count / analytics.totalRequests) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none mb-6">
        <CardHeader className="border-b border-cyan-100 dark:border-cyan-900">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <CardTitle className="text-cyan-900 dark:text-cyan-100">Request Timeline</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {analytics.timelineData.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              No data available for the selected time period
            </div>
          ) : (
            <div className="h-64">
              <div className="h-full flex items-end">
                {analytics.timelineData.map((item, index) => {
                  const maxCount = Math.max(...analytics.timelineData.map((d) => d.count))
                  const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0

                  // Only show every nth label to prevent overcrowding
                  const showLabel =
                    timeRange === "7days" ||
                    index % (timeRange === "30days" ? 5 : timeRange === "90days" ? 15 : 30) === 0

                  return (
                    <div key={item.date} className="flex flex-col items-center flex-1 group">
                      <div className="relative w-full px-1">
                        <div
                          className="w-full bg-cyan-600 dark:bg-cyan-400 rounded-t"
                          style={{ height: `${height}%`, minHeight: item.count > 0 ? "4px" : "0" }}
                        ></div>
                        <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 bg-black bg-opacity-75 text-white text-xs rounded py-1 px-2 pointer-events-none text-center transition-opacity">
                          {item.date}: {item.count} requests
                        </div>
                      </div>
                      {showLabel && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                          {item.date.split(", ")[0]}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <a href="/admin/support" className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
          <LifeBuoy className="h-4 w-4" />
          View All Support Requests
        </a>
      </div>
    </div>
  )
}
