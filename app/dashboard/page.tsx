"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "next-auth/react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 bg-gradient-to-b from-slate-50 to-cyan-50">
      <Card className="border-cyan-200 shadow-lg shadow-cyan-100">
        <CardHeader className="border-b border-cyan-100">
          <CardTitle className="text-cyan-900">Ship's Deck</CardTitle>
          <CardDescription>Navigate your maritime media journey</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-cyan-800">Ahoy, {session?.user?.name}!</h2>
              <p className="text-cyan-600">Message in a bottle: {session?.user?.email}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button onClick={() => router.push("/podcasts")} className="bg-cyan-600 hover:bg-cyan-700">
                Sea Waves
              </Button>
              <Button onClick={() => router.push("/news")} className="bg-cyan-600 hover:bg-cyan-700">
                Maritime Reports
              </Button>
              <Button onClick={() => router.push("/videos")} className="bg-cyan-600 hover:bg-cyan-700">
                Sea Shorts
              </Button>
              <Button onClick={() => router.push("/photos")} className="bg-cyan-600 hover:bg-cyan-700">
                Sea Snaps
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="text-cyan-700 border-cyan-300 hover:bg-cyan-50"
            >
              Abandon Ship
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
