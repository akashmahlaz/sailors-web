"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Filter, RefreshCw, AlertCircle } from "lucide-react"

type ActivityLog = {
  _id: string
  adminId: string
  adminName: string
  action: string
  resource: string
  resourceId: string
  details: string
  ipAddress: string
  timestamp: string
}

type PaginationInfo = {
  page: number
  limit: number
  total: number
  pages: number
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionFilter, setActionFilter] = useState("")
  const [resourceFilter, setResourceFilter] = useState("")
  const [adminFilter, setAdminFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })

  useEffect(() => {
    loadLogs()
  }, [actionFilter, resourceFilter, adminFilter, page])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (actionFilter) queryParams.append("action", actionFilter)
      if (resourceFilter) queryParams.append("resource", resourceFilter)
      if (adminFilter) queryParams.append("adminId", adminFilter)
      queryParams.append("page", page.toString())

      const response = await fetch(`/api/admin/activity-logs?${queryParams.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs)
        setPagination(data.pagination)
      } else {
        setError(data.error || "Failed to load activity logs")
      }
    } catch (err) {
      setError("An error occurred while loading activity logs")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "bg-green-100 text-green-800"
      case "update":
        return "bg-blue-100 text-blue-800"
      case "delete":
        return "bg-red-100 text-red-800"
      case "view":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getResourceColor = (resource: string) => {
    switch (resource.toLowerCase()) {
      case "user":
      case "users":
        return "bg-purple-100 text-purple-800"
      case "blog":
      case "blogs":
        return "bg-indigo-100 text-indigo-800"
      case "video":
      case "videos":
        return "bg-pink-100 text-pink-800"
      case "audio":
        return "bg-yellow-100 text-yellow-800"
      case "photo":
      case "photos":
        return "bg-green-100 text-green-800"
      case "support":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex flex-wrap gap-4">
            <select
              className="px-4 py-2 border rounded-lg"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg"
              value={resourceFilter}
              onChange={(e) => {
                setResourceFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">All Resources</option>
              <option value="user">User</option>
              <option value="blog">Blog</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="photo">Photo</option>
              <option value="support">Support</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setActionFilter("")
                setResourceFilter("")
                setAdminFilter("")
                setPage(1)
              }}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Reset Filters
            </Button>

            <Button variant="outline" onClick={() => loadLogs()} className="flex items-center gap-2">
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Activity logs table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-4 border-b text-left">Admin</th>
                <th className="py-2 px-4 border-b text-left">Action</th>
                <th className="py-2 px-4 border-b text-left">Resource</th>
                <th className="py-2 px-4 border-b text-left">Details</th>
                <th className="py-2 px-4 border-b text-left">IP Address</th>
                <th className="py-2 px-4 border-b text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Skeleton className="h-6 w-16" />
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Skeleton className="h-6 w-40" />
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Skeleton className="h-6 w-32" />
                      </td>
                    </tr>
                  ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{log.adminName}</td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResourceColor(log.resource)}`}>
                        {log.resource}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{log.details}</td>
                    <td className="py-2 px-4 border-b">{log.ipAddress}</td>
                    <td className="py-2 px-4 border-b">{formatDate(log.timestamp)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                <ChevronLeft size={16} />
              </Button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                // Show pages around the current page
                let pageToShow = page
                if (page <= 3) {
                  pageToShow = i + 1
                } else if (page >= pagination.pages - 2) {
                  pageToShow = pagination.pages - 4 + i
                } else {
                  pageToShow = page - 2 + i
                }

                // Ensure we don't show pages below 1 or above the total
                if (pageToShow < 1 || pageToShow > pagination.pages) {
                  return null
                }

                return (
                  <Button
                    key={pageToShow}
                    variant={pageToShow === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageToShow)}
                  >
                    {pageToShow}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
