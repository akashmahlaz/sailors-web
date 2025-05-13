"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ArrowLeft, Download, Eye, LifeBuoy, Shield } from "lucide-react"
import Link from "next/link"
import type { SupportRequest } from "@/lib/support-requests"

export default function SupportRequestDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [supportRequest, setSupportRequest] = useState<SupportRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<"pending" | "in-review" | "resolved" | "dismissed" | "">("")
  const [adminNotes, setAdminNotes] = useState("")
  const [resolution, setResolution] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState(false)

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  // Fetch support request details
  useEffect(() => {
    const fetchSupportRequest = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/support/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch support request")
        }

        const data = await response.json()
        setSupportRequest(data)
        setUpdateStatus(data.status)
        setAdminNotes(data.adminNotes || "")
        setResolution(data.resolution || "")
      } catch (err) {
        console.error("Error fetching support request:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch support request")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchSupportRequest()
    }
  }, [params.id, session, status])

  // Update support request
  const handleUpdate = async () => {
    try {
      setUpdating(true)
      setError(null)

      const response = await fetch(`/api/support/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: updateStatus,
          adminNotes,
          resolution,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update support request")
      }

      // Update local state
      setSupportRequest((prev) => {
        if (!prev) return null
        return {
          ...prev,
          status: updateStatus,
          adminNotes,
          resolution,
        }
      })

      setUpdateSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("Error updating support request:", err)
      setError(err instanceof Error ? err.message : "Failed to update support request")
    } finally {
      setUpdating(false)
    }
  }

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

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading support request details...</p>
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/admin/support")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Support Requests
          </Button>
        </div>
      </div>
    )
  }

  if (!supportRequest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Support request not found</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/admin/support")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Support Requests
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-slate-50 to-amber-50 dark:from-slate-950 dark:to-amber-950">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link href="/admin/support">
            <Button variant="outline" className="mb-2 border-amber-200 dark:border-amber-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Support Requests
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-amber-700 dark:text-amber-300" />
            Support Request Details
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400">Status:</span>
          {getStatusBadge(supportRequest.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-amber-200 shadow-lg shadow-amber-100 dark:border-amber-900 dark:shadow-none">
            <CardHeader className="border-b border-amber-100 dark:border-amber-900 bg-gradient-to-r from-amber-50 to-white dark:from-slate-900 dark:to-amber-950">
              <CardTitle className="text-amber-900 dark:text-amber-100">{supportRequest.title}</CardTitle>
              <CardDescription>
                {supportRequest.category} • Submitted {formatDate(supportRequest.createdAt)}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Submitted By</h3>
                  <p className="text-slate-900 dark:text-slate-100">
                    {supportRequest.isAnonymous ? (
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        Anonymous Submission
                      </span>
                    ) : (
                      <span>
                        {supportRequest.submitterName || "Unknown"} (
                        {supportRequest.submitterEmail || "No email provided"})
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Description</h3>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-md border border-amber-100 dark:border-amber-900 whitespace-pre-wrap">
                    {supportRequest.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 shadow-lg shadow-amber-100 dark:border-amber-900 dark:shadow-none">
            <CardHeader className="border-b border-amber-100 dark:border-amber-900 bg-gradient-to-r from-amber-50 to-white dark:from-slate-900 dark:to-amber-950">
              <CardTitle className="text-amber-900 dark:text-amber-100">Admin Response</CardTitle>
              <CardDescription>Update status and provide resolution details</CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {updateSuccess && (
                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-900">
                  <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription>Support request updated successfully</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={updateStatus} onValueChange={setUpdateStatus}>
                    <SelectTrigger id="status" className="border-amber-200 dark:border-amber-900">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-review">In Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin Notes (Internal Only)</Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this support request"
                    rows={4}
                    className="border-amber-200 dark:border-amber-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution Details</Label>
                  <Textarea
                    id="resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Provide details about how this issue was resolved"
                    rows={4}
                    className="border-amber-200 dark:border-amber-900"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-amber-100 dark:border-amber-900 bg-gradient-to-r from-white to-amber-50 dark:from-slate-900 dark:to-amber-950 py-4">
              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="ml-auto bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
              >
                {updating ? "Updating..." : "Update Support Request"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="border-amber-200 shadow-lg shadow-amber-100 dark:border-amber-900 dark:shadow-none">
            <CardHeader className="border-b border-amber-100 dark:border-amber-900 bg-gradient-to-r from-amber-50 to-white dark:from-slate-900 dark:to-amber-950">
              <CardTitle className="text-amber-900 dark:text-amber-100">Supporting Evidence</CardTitle>
              <CardDescription>
                {supportRequest.proofs.length} item{supportRequest.proofs.length !== 1 ? "s" : ""} attached
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {supportRequest.proofs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                  <Shield className="h-12 w-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p>No supporting evidence attached</p>
                </div>
              ) : (
                <div className="divide-y divide-amber-100 dark:divide-amber-900">
                  {supportRequest.proofs.map((proof, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {proof.resourceType === "image" ? (
                            <div className="h-12 w-12 rounded overflow-hidden bg-slate-100 dark:bg-slate-800">
                              <img
                                src={proof.url || "/placeholder.svg"}
                                alt="Evidence"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : proof.resourceType === "video" ? (
                            <div className="h-12 w-12 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <video src={proof.url} className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                              <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {proof.publicId.split("/").pop() || "File"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {proof.resourceType}/{proof.format}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={proof.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-md bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </a>

                          <a
                            href={proof.url}
                            download
                            className="inline-flex items-center justify-center h-8 px-3 text-xs font-medium rounded-md bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:hover:bg-amber-800"
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
