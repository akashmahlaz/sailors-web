"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Database } from "lucide-react"

export default function DbInitializer() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const initializeDb = async () => {
    try {
      setStatus("loading")
      setMessage("Initializing MongoDB database...")

      const response = await fetch("/api/init-db")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || response.statusText)
      }

      const data = await response.json()

      setStatus("success")
      setMessage(data.message || "MongoDB database initialized successfully!")
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Failed to initialize MongoDB database")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>MongoDB Setup</CardTitle>
        <CardDescription>Initialize the MongoDB database for storing video metadata</CardDescription>
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

          <Button onClick={initializeDb} disabled={status === "loading"} variant="outline" className="w-full">
            {status === "loading" ? (
              "Initializing..."
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" /> Initialize MongoDB
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
