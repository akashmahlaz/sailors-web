"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, LifeBuoy, Shield } from "lucide-react"
import MultiMediaUploader from "@/components/multi-media-uploader"
import { supportTemplates, getTemplateById } from "@/lib/support-templates"

interface UploadedMedia {
  url: string
  publicId: string
  resourceType: string
  format: string
  name?: string
}

export default function SupportRequestForm() {
  const { data: session } = useSession()
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [proofs, setProofs] = useState<UploadedMedia[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const handleMediaUpload = (media: UploadedMedia) => {
    setProofs((prev) => [...prev, media])
  }

  const removeProof = (index: number) => {
    setProofs((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)

    if (templateId) {
      const template = getTemplateById(templateId)
      if (template) {
        setTitle(template.title)
        setCategory(template.category)
        setDescription(template.description)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !category) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          isAnonymous,
          proofs,
          submitterId: !isAnonymous && session?.user?.id ? session.user.id : undefined,
          submitterName: !isAnonymous && session?.user?.name ? session.user.name : undefined,
          submitterEmail: !isAnonymous && session?.user?.email ? session.user.email : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit support request")
      }

      setSuccess(true)

      // Reset form after successful submission
      setTimeout(() => {
        setTitle("")
        setDescription("")
        setCategory("")
        setIsAnonymous(false)
        setProofs([])
        setSuccess(false)
        router.push("/dashboard")
      }, 3000)
    } catch (err) {
      console.error("Error submitting support request:", err)
      setError(err instanceof Error ? err.message : "Failed to submit support request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border-cyan-200 shadow-lg shadow-cyan-100 dark:border-cyan-900 dark:shadow-none">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-slate-50 dark:from-slate-900 dark:to-cyan-950 border-b border-cyan-100 dark:border-cyan-900">
        <CardTitle className="flex items-center gap-2 text-cyan-900 dark:text-cyan-100">
          <LifeBuoy className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          Sailor Support Request
        </CardTitle>
        <CardDescription>Submit your concerns confidentially to the ship's officers</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-900">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your support request has been submitted successfully. A ship's officer will review it shortly.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="template">Use a Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange} disabled={isSubmitting || success}>
              <SelectTrigger id="template" className="border-cyan-200 dark:border-cyan-900">
                <SelectValue placeholder="Select a template (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Template</SelectItem>
                {supportTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Templates provide pre-filled information for common issues
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Issue Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title describing your issue"
              required
              disabled={isSubmitting || success}
              className="border-cyan-200 dark:border-cyan-900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory} disabled={isSubmitting || success}>
              <SelectTrigger className="border-cyan-200 dark:border-cyan-900">
                <SelectValue placeholder="Select issue category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="discrimination">Discrimination</SelectItem>
                <SelectItem value="safety">Safety Concern</SelectItem>
                <SelectItem value="misconduct">Misconduct</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Detailed Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide a detailed description of the issue, including dates, locations, and individuals involved"
              rows={6}
              required
              disabled={isSubmitting || success}
              className="border-cyan-200 dark:border-cyan-900"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
              disabled={isSubmitting || success}
            />
            <Label htmlFor="anonymous" className="cursor-pointer">
              Submit Anonymously
            </Label>
          </div>

          {isAnonymous && (
            <Alert className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription>
                Your identity will be kept confidential. Note that this may limit our ability to follow up directly.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Supporting Evidence</Label>
            <div className="border border-cyan-200 dark:border-cyan-900 rounded-md p-4 bg-slate-50 dark:bg-slate-900">
              <MultiMediaUploader onUploadSuccess={handleMediaUpload} />

              {proofs.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Uploaded Evidence:</Label>
                  <div className="grid gap-2">
                    {proofs.map((proof, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border border-cyan-100 dark:border-cyan-900"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {proof.resourceType === "image" ? (
                            <img
                              src={proof.url || "/placeholder.svg"}
                              alt="Evidence"
                              className="h-10 w-10 object-cover rounded"
                            />
                          ) : proof.resourceType === "video" ? (
                            <video src={proof.url} className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <div className="h-10 w-10 bg-cyan-100 dark:bg-cyan-900 rounded flex items-center justify-center">
                              <Shield className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                            </div>
                          )}
                          <span className="truncate text-sm">{proof.publicId.split("/").pop()}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProof(index)}
                          disabled={isSubmitting || success}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-cyan-100 dark:border-cyan-900 bg-gradient-to-r from-slate-50 to-cyan-50 dark:from-slate-900 dark:to-cyan-950 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting || success}
            className="border-cyan-200 dark:border-cyan-900"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || success}
            className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600"
          >
            {isSubmitting ? "Submitting..." : "Submit Support Request"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
