"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function EnvChecker() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const checkEnv = async () => {
    try {
      setStatus("loading")
      setMessage("Checking environment variables...")

      const res = await fetch("/api/check-env")
      const data = await res.json()

      if (data.success) {
        setStatus("success")
        setMessage("Environment variables are correctly set!")
      } else {
        setStatus("error")
        setMessage(data.error || "Unknown error checking environment variables")
      }
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Failed to check environment variables")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Environment Variables Check</CardTitle>
        <CardDescription>Verify your Cloudinary and MongoDB configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>{message}</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{message}</span>
            </div>
          )}

          <Button onClick={checkEnv} disabled={status === "loading"} variant="outline" className="w-full">
            {status === "loading" ? "Checking..." : "Check Environment Variables"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
