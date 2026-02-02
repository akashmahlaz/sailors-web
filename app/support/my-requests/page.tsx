"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LifeBuoy, Search, Filter, Clock, CheckCircle, AlertCircle, FileText, Eye, Calendar, Shield } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface SupportRequest {
  id: string
  title: string
  description: string
  category: string
  status: string
  createdAt: string
  updatedAt: string
  adminNotes?: string
  resolution?: string
  proofs: Array<{
    url: string
    publicId: string
    resourceType: string
    format: string
    name?: string
  }>
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Your request has been received and is awaiting review"
  },
  in_progress: {
    label: "In Progress",
    icon: AlertCircle,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "A ship's officer is actively reviewing your request"
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Your request has been resolved"
  },
  closed: {
    label: "Closed",
    icon: Shield,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    description: "This request has been closed"
  }
}

export default function MySupportRequests() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<SupportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
      return
    }

    if (status === "authenticated") {
      fetchRequests()
    }
  }, [status, router])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter, categoryFilter, activeTab])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/support/my-requests")

      if (!response.ok) {
        throw new Error("Failed to fetch support requests")
      }

      const data = await response.json()
      setRequests(data)
    } catch (err) {
      console.error("Error fetching requests:", err)
      setError(err instanceof Error ? err.message : "Failed to load support requests")
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = [...requests]

    if (activeTab !== "all") {
      filtered = filtered.filter(req => req.status === activeTab)
    }

    if (statusFilter !== "all" && activeTab === "all") {
      filtered = filtered.filter(req => req.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(req => req.category === categoryFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        req =>
          req.title.toLowerCase().includes(term) ||
          req.description.toLowerCase().includes(term) ||
          req.id.toLowerCase().includes(term)
      )
    }

    setFilteredRequests(filtered)
  }

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    return <Icon className="h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    return (
      <Badge variant="outline" className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const categories = Array.from(new Set(requests.map(req => req.category)))

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your support requests...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LifeBuoy className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Support Requests</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your support requests
          </p>
        </div>

        <div className="grid gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by title, description, or request ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No support requests found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                {requests.length === 0
                  ? "You haven't submitted any support requests yet."
                  : "Try adjusting your filters or search terms."}
              </p>
              <Link href="/support">
                <Button>
                  <LifeBuoy className="h-4 w-4 mr-2" />
                  Submit New Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request) => {
              const statusInfo = statusConfig[request.status as keyof typeof statusConfig]
              return (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{request.title}</CardTitle>
                          {getStatusBadge(request.status)}
                        </div>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(request.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            ID: {request.id.substring(0, 8)}...
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {request.description}
                        </p>
                      </div>

                      {request.adminNotes && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Admin Notes
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {request.adminNotes}
                          </p>
                        </div>
                      )}

                      {request.resolution && (
                        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Resolution
                          </h4>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            {request.resolution}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="capitalize">
                            {request.category}
                          </Badge>
                          {request.proofs && request.proofs.length > 0 && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              📎 {request.proofs.length} {request.proofs.length === 1 ? 'attachment' : 'attachments'}
                            </span>
                          )}
                        </div>
                        <Link href={`/support/my-requests/${request.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {filteredRequests.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredRequests.length} of {requests.length} {requests.length === 1 ? 'request' : 'requests'}
          </div>
        )}
      </div>
    </div>
  )
}
