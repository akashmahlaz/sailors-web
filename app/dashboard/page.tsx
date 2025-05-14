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
    <div className="container mx-auto py-10 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 min-h-screen">
      <Card className="border-emerald-200 shadow-lg dark:border-emerald-900 dark:shadow-none">
        <CardHeader className="border-b border-emerald-100 dark:border-emerald-900">
          <CardTitle className="text-emerald-900 dark:text-emerald-200">Ship's Deck</CardTitle>
          <CardDescription>Navigate your maritime media journey</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">Ahoy, {session?.user?.name}!</h2>
              <p className="text-emerald-600 dark:text-emerald-400">Message in a bottle: {session?.user?.email}</p>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Button onClick={() => router.push("/podcasts")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Sea Waves
              </Button>
              <Button onClick={() => router.push("/news")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Maritime Reports
              </Button>
              <Button onClick={() => router.push("/videos")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Sea Shorts
              </Button>
              <Button onClick={() => router.push("/photos")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Sea Snaps
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-emerald-900"
            >
              Abandon Ship
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
