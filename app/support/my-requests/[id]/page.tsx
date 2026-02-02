"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Calendar, Shield, FileText, Image, Video, Download, CheckCircle, Clock, AlertCircle } from "lucide-react"
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

export default function SupportRequestDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()

  const [request, setRequest] = useState<SupportRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
      return
    }

    if (status === "authenticated" && params.id) {
      fetchRequest()
    }
  }, [status, params.id, router])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/support/my-requests?search=${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch support request")
      }

      const data = await response.json()
      const foundRequest = data.find((req: SupportRequest) => req.id === params.id)

      if (!foundRequest) {
        throw new Error("Support request not found")
      }

      setRequest(foundRequest)
    } catch (err) {
      console.error("Error fetching request:", err)
      setError(err instanceof Error ? err.message : "Failed to load support request")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    return <Icon className="h-5 w-5" />
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    return (
      <Badge variant="outline" className={`${config.color} gap-2 px-4 py-1.5`}>
        <Icon className="h-4 w-4" />
        {config.label}
      </Badge>
    )
  }

  const renderProof = (proof: SupportRequest["proofs"][0]) => {
    const Icon = proof.resourceType === "image" ? Image : proof.resourceType === "video" ? Video : FileText

    return (
      <Card key={proof.publicId} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                {proof.name || proof.publicId.split("/").pop()}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {proof.resourceType.charAt(0).toUpperCase() + proof.resourceType.slice(1)} • {proof.format}
              </p>
              <div className="flex gap-2">
                <a
                  href={proof.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View
                </a>
                <a
                  href={proof.url}
                  download
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </div>
            </div>
          </div>
          {proof.resourceType === "image" && (
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={proof.url}
                alt={proof.name || proof.publicId}
                className="w-full h-auto"
                style={{ maxHeight: "300px", objectFit: "contain" }}
              />
            </div>
          )}
          {proof.resourceType === "video" && (
            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <video src={proof.url} controls className="w-full h-auto" style={{ maxHeight: "300px" }} />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading support request details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Support request not found"}</AlertDescription>
        </Alert>
        <Link href="/support/my-requests">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Requests
          </Button>
        </Link>
      </div>
    )
  }

  const statusInfo = statusConfig[request.status as keyof typeof statusConfig]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/support/my-requests">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Requests
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-2xl md:text-3xl">{request.title}</CardTitle>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    {getStatusBadge(request.status)}
                    <Badge variant="outline" className="capitalize">
                      {request.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Submitted: {format(new Date(request.createdAt), "MMMM dd, yyyy 'at' h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Request ID: {request.id}</span>
                  </div>
                </div>

                <Alert>
                  <statusInfo.icon className="h-4 w-4" />
                  <AlertTitle>Status: {statusInfo.label}</AlertTitle>
                  <AlertDescription>{statusInfo.description}</AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {request.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {request.proofs && request.proofs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Supporting Evidence</CardTitle>
                <CardDescription>
                  {request.proofs.length} {request.proofs.length === 1 ? 'file' : 'files'} attached
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {request.proofs.map((proof) => renderProof(proof))}
                </div>
              </CardContent>
            </Card>
          )}

          {request.adminNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Admin Notes
                </CardTitle>
                <CardDescription>
                  Updates from the ship's officer handling your request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-900 dark:text-blue-100 whitespace-pre-wrap">
                    {request.adminNotes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {request.resolution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Resolution
                </CardTitle>
                <CardDescription>
                  Final resolution for your support request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-900 dark:text-green-100 whitespace-pre-wrap">
                    {request.resolution}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <div className="w-px h-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900 dark:text-white">Request Submitted</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(request.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                {request.updatedAt !== request.createdAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold text-gray-900 dark:text-white">Last Updated</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(request.updatedAt), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
