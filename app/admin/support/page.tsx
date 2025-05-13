"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, LifeBuoy, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import type { SupportRequest } from "@/lib/support-requests"

export default function AdminSupportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "in-review" | "resolved" | "dismissed">("all")
  const [searchQuery, setSearchQuery] = useState("")

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

  // Filter and search support requests
  const filteredRequests = supportRequests.filter((request) => {
    // Apply status filter
    if (filter !== "all" && request.status !== filter) {
      return false
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        request.title.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query) ||
        request.category.toLowerCase().includes(query) ||
        (request.submitterName && request.submitterName.toLowerCase().includes(query))
      )
    }

    return true
  })

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800"
          >
            Pending
          </Badge>
        )
      case "in-review":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800"
          >
            In Review
          </Badge>
        )
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-200 dark:border-green-800"
          >
            Resolved
          </Badge>
        )
      case "dismissed":
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-950 dark:text-slate-200 dark:border-slate-800"
          >
            Dismissed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-slate-50 to-amber-50 dark:from-slate-950 dark:to-amber-950">
      <h1 className="mb-6 text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
        <LifeBuoy className="h-6 w-6 text-amber-700 dark:text-amber-300" />
        Sailor Support Management
      </h1>

      <Card className="border-amber-200 shadow-lg shadow-amber-100 dark:border-amber-900 dark:shadow-none">
        <CardHeader className="border-b border-amber-100 dark:border-amber-900 bg-gradient-to-r from-amber-50 to-white dark:from-slate-900 dark:to-amber-950">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-amber-900 dark:text-amber-100">Support Requests</CardTitle>
              <CardDescription>Manage and respond to sailor support requests</CardDescription>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search requests..."
                className="pl-8 border-amber-200 dark:border-amber-900 w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)}>
            <div className="border-b border-amber-100 dark:border-amber-900 px-4">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="in-review"
                  className="data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900"
                >
                  In Review
                </TabsTrigger>
                <TabsTrigger
                  value="resolved"
                  className="data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900"
                >
                  Resolved
                </TabsTrigger>
                <TabsTrigger
                  value="dismissed"
                  className="data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900"
                >
                  Dismissed
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              {renderSupportRequestsList(filteredRequests)}
            </TabsContent>
            <TabsContent value="pending" className="m-0">
              {renderSupportRequestsList(filteredRequests)}
            </TabsContent>
            <TabsContent value="in-review" className="m-0">
              {renderSupportRequestsList(filteredRequests)}
            </TabsContent>
            <TabsContent value="resolved" className="m-0">
              {renderSupportRequestsList(filteredRequests)}
            </TabsContent>
            <TabsContent value="dismissed" className="m-0">
              {renderSupportRequestsList(filteredRequests)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )

  function renderSupportRequestsList(requests: SupportRequest[]) {
    if (loading) {
      return (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          <div className="animate-spin h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading support requests...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )
    }

    if (requests.length === 0) {
      return (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
          <LifeBuoy className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p>No support requests found</p>
        </div>
      )
    }

    return (
      <div className="divide-y divide-amber-100 dark:divide-amber-900">
        {requests.map((request) => (
          <div key={request.id} className="p-4 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-amber-900 dark:text-amber-100">{request.title}</h3>
                  {getStatusBadge(request.status)}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                  <span>Category: {request.category}</span>
                  <span>•</span>
                  <span>{request.isAnonymous ? "Anonymous" : `From: ${request.submitterName || "Unknown"}`}</span>
                  <span>•</span>
                  <span>Submitted: {formatDate(request.createdAt)}</span>
                </div>

                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{request.description}</p>
              </div>

              <div>
                <Link href={`/admin/support/${request.id}`}>
                  <Button className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}
